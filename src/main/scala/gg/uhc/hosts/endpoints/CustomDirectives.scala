package gg.uhc.hosts.endpoints

import java.net.InetAddress

import scala.concurrent.Future
import scala.util.{Failure, Success}

import org.apache.pekko.http.scaladsl.model.{HttpMethod, HttpMethods, RemoteAddress}
import org.apache.pekko.http.scaladsl.model.headers.{
  `Access-Control-Allow-Origin`,
  HttpChallenges,
  HttpOrigin,
  RawHeader
}
import org.apache.pekko.http.scaladsl.server.{AuthenticationFailedRejection, Directive0, Directive1}
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.directives.Credentials
import cats.data.OptionT
import doobie.*
import doobie.free.connection
import gg.uhc.hosts.authentication.{Authenticated, SessionCookie, SessionStore}
import gg.uhc.hosts.database.{Database, LiveSession}

class CustomDirectives(database: Database, sessions: SessionStore) {
  def requireRemoteIp: Directive1[InetAddress] =
    extractClientIP flatMap {
      case RemoteAddress.Unknown   => reject(MissingIpErrorRejection())
      case RemoteAddress.IP(ip, _) => provide(ip)
    }

  def checkHasAtLeastOnePermission(permissions: Iterable[String], username: String): Directive1[Boolean] =
    requireSucessfulQuery(database.getPermissions(username)).flatMap {
      case l if l.intersect(permissions.toList).nonEmpty => provide(true)
      case _                                             => provide(false)
    }

  def checkHasPermission(permission: String, username: String): Directive1[Boolean] =
    checkHasAtLeastOnePermission(permission :: Nil, username)

  def requireAtLeastOnePermission(permissions: Iterable[String], username: String): Directive0 =
    checkHasAtLeastOnePermission(permissions, username) flatMap {
      case true  => pass
      case false =>
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsRejected,
            HttpChallenges.basic("reddit")
          )
        )
    }

  def requirePermission(permission: String, username: String): Directive0 =
    requireAtLeastOnePermission(permission :: Nil, username)

  val optionalSessionAuthenticationWithId: Directive1[Option[(Authenticated, LiveSession)]] =
    optionalCookie(SessionCookie.name) flatMap {
      case None    => provide(None)
      case Some(c) =>
        requireSucessfulFuture(sessions.lookup(c.value)) flatMap {
          case Some(session) => provide(Some((Authenticated(session.username, session.permissions), session)))
          case None          => provide(None)
        }
    }

  val requireSessionAuthenticationWithId: Directive1[(Authenticated, LiveSession)] =
    optionalSessionAuthenticationWithId flatMap {
      case Some(pair) => provide(pair)
      case None       =>
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("reddit")
          )
        )
    }

  val requireSessionAuthentication: Directive1[Authenticated] =
    requireSessionAuthenticationWithId.map(_._1)

  val optionalSessionAuthentication: Directive1[Option[Authenticated]] =
    optionalSessionAuthenticationWithId.map(_.map(_._1))

  def apiTokenAuthenticator(credentials: Credentials): Future[Option[Authenticated]] =
    credentials match {
      case p @ Credentials.Provided(id) =>
        val query: OptionT[ConnectionIO, Authenticated] = (for {
          key   <- OptionT[ConnectionIO, String] {
                     database.getUserApiKey(id)
                   }
          _     <- OptionT[ConnectionIO, Unit] {
                     if p.verify(key) then connection.raw(_ => Some(()))
                     else connection.raw(_ => None)
                   }
          perms <- OptionT[ConnectionIO, List[String]](
                     database.getPermissions(id).map(Some(_))
                   )
        } yield Authenticated(username = id, permissions = perms))

        database.run(query.value)
      case _                            => Future.successful(None)
    }

  def requireApiTokenAuthentication: Directive1[Authenticated] =
    optionalApiTokenAuthentication.flatMap {
      case Some(token) =>
        provide(token)
      case None        =>
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("user api token")
          )
        )
    }

  def optionalApiTokenAuthentication: Directive1[Option[Authenticated]] =
    authenticateBasicAsync(realm = "user api token", apiTokenAuthenticator).optional

  def requireAuthentication: Directive1[Authenticated] =
    optionalSessionAuthentication.flatMap {
      case Some(a) => provide(a)
      case None    => requireApiTokenAuthentication
    }

  def optionalAuthentication: Directive1[Option[Authenticated]] =
    optionalSessionAuthentication.flatMap {
      case a @ Some(_) => provide(a)
      case None        => optionalApiTokenAuthentication
    }

  /**
   * Rejects with a DatabaseErrorRejection if query fails, otherwise passes connectionIo return type
   */
  def requireSucessfulQuery[T](query: ConnectionIO[T]): Directive1[T] = {
    onComplete(database.run(query)) flatMap {
      case Success(value) => provide(value)
      case Failure(t)     => reject(DatabaseErrorRejection(t))
    }
  }

  def requireSucessfulFuture[T](future: Future[T]): Directive1[T] =
    onComplete(future) flatMap {
      case Success(value) => provide(value)
      case Failure(t)     => reject(DatabaseErrorRejection(t))
    }

  val trustedOrigins: Set[String] = Set(
    "https://hosts.uhc.gg",
    "https://c.uhc.gg",
    "http://localhost",
    "http://127.0.0.1"
  )

  private val mutatingMethods: Set[HttpMethod] =
    Set(HttpMethods.POST, HttpMethods.PATCH, HttpMethods.PUT, HttpMethods.DELETE)

  private def trustedOrigin: Directive0 =
    optionalHeaderValueByName("Sec-Fetch-Site") flatMap {
      case Some("same-origin") => pass
      case Some(other)         => reject(CsrfRejection(s"Sec-Fetch-Site: $other"))
      case None                =>
        optionalHeaderValueByName("Origin") flatMap {
          case None                                            => pass
          case Some(origin) if trustedOrigins.contains(origin) => pass
          case Some(origin)                                    => reject(CsrfRejection(s"Origin: $origin"))
        }
    }

  val csrfGuard: Directive0 =
    extractMethod flatMap { method =>
      if !mutatingMethods.contains(method) then pass
      else
        optionalCookie(SessionCookie.name) flatMap {
          case None    => pass
          case Some(_) =>
            optionalHeaderValueByName("X-CSRF") flatMap {
              case Some("1")   => trustedOrigin
              case Some(other) => reject(CsrfRejection(s"X-CSRF: $other"))
              case None        => reject(CsrfRejection("missing X-CSRF header"))
            }
        }
    }

  val echoCorsOrigin: Directive0 =
    optionalHeaderValueByName("Origin") flatMap {
      case Some(origin) if trustedOrigins.contains(origin) =>
        respondWithHeader(`Access-Control-Allow-Origin`(HttpOrigin(origin))) &
          respondWithHeader(RawHeader("Vary", "Origin"))
      case _                                               =>
        respondWithHeader(RawHeader("Vary", "Origin"))
    }
}
