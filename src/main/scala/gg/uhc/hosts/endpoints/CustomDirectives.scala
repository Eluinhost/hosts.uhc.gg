package gg.uhc.hosts.endpoints

import java.net.InetAddress

import akka.http.scaladsl.model.RemoteAddress
import akka.http.scaladsl.model.headers.{Authorization, HttpChallenges, OAuth2BearerToken}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.directives.Credentials
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive0, Directive1}
import doobie.free.connection
import doobie.imports._
import gg.uhc.hosts.authentication.Session.{Authenticated, RefreshToken}
import gg.uhc.hosts.database.Database

import scala.concurrent.Future
import scala.util.{Failure, Success}
import scalaz.OptionT

class CustomDirectives(database: Database) {
  def requireRemoteIp: Directive1[InetAddress] =
    extractClientIP flatMap {
      case RemoteAddress.Unknown   ⇒ reject(MissingIpErrorRejection())
      case RemoteAddress.IP(ip, _) ⇒ provide(ip)
    }

  def checkHasAtLeastOnePermission(permissions: List[String], username: String): Directive1[Boolean] =
    requireSucessfulQuery(database.getPermissions(username)).flatMap {
      case l if l.intersect(permissions).nonEmpty ⇒ provide(true)
      case _                                      ⇒ provide(false)
    }

  def checkHasPermission(permission: String, username: String): Directive1[Boolean] =
    checkHasAtLeastOnePermission(permission :: Nil, username)

  def requireAtLeastOnePermission(permissions: List[String], username: String): Directive0 =
    checkHasAtLeastOnePermission(permissions, username) flatMap {
      case true ⇒ pass
      case false ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsRejected,
            HttpChallenges.basic("reddit")
          )
        )
    }

  def requirePermission(permission: String, username: String): Directive0 =
    requireAtLeastOnePermission(permission :: Nil, username)

  /**
    * Checks for an OAuth2 bearer token header with a valid non-expired JWT token.
    */
  val optionalJwtAuthentication: Directive1[Option[Authenticated]] =
    optionalHeaderValuePF {
      case Authorization(OAuth2BearerToken(token)) ⇒ token
    } flatMap { maybeToken ⇒
      provide(maybeToken.flatMap(Authenticated.fromJwt))
    }

  /**
    * Rejects with authentication failed reject if header missing or invalid JWT token
    */
  val requireJwtAuthentication: Directive1[Authenticated] =
    optionalJwtAuthentication.flatMap {
      case Some(token) ⇒
        provide(token)
      case None ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("reddit")
          )
        )
    }

  val optionalRefreshAuthentication: Directive1[Option[RefreshToken]] =
    optionalHeaderValuePF {
      case Authorization(OAuth2BearerToken(token)) ⇒ token
    } flatMap { maybeToken ⇒
      provide(maybeToken.flatMap(RefreshToken.fromJwt))
    }

  val requireRefreshAuthentication: Directive1[RefreshToken] =
    optionalRefreshAuthentication.flatMap {
      case Some(token) ⇒
        provide(token)
      case None ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("reddit")
          )
        )
    }

  def apiTokenAuthenticator(credentials: Credentials): Future[Option[Authenticated]] =
    credentials match {
      case p @ Credentials.Provided(id) ⇒
        val query = (for {
          key ← OptionT[ConnectionIO, String] {
            database.getUserApiKey(id)
          }
          _ ← OptionT[ConnectionIO, Unit] {
            if (p.verify(key)) connection.raw(_ ⇒ Some(Unit))
            else connection.raw(_ ⇒ None)
          }
          perms ← OptionT[ConnectionIO, List[String]](
            database.getPermissions(id).map(Some(_))
          )
        } yield Authenticated(username = id, permissions = perms)).run

        database.run(query)
      case _ ⇒ Future.successful(None)
    }

  def requireApiTokenAuthentication: Directive1[Authenticated] =
    optionalApiTokenAuthentication.flatMap {
      case Some(token) ⇒
        provide(token)
      case None ⇒
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
    optionalJwtAuthentication.flatMap {
      case Some(a) ⇒ provide(a)
      case None    ⇒ requireApiTokenAuthentication
    }

  def optionalAuthentication: Directive1[Option[Authenticated]] =
    optionalJwtAuthentication.flatMap {
      case a @ Some(_) ⇒ provide(a)
      case None        ⇒ optionalApiTokenAuthentication
    }

  /**
    * Rejects with a DatabaseErrorRejection if query fails, otherwise passes connectionIo return type
    */
  def requireSucessfulQuery[T](query: ConnectionIO[T]): Directive1[T] = {
    onComplete(database.run(query)) flatMap {
      case Success(value) ⇒ provide(value)
      case Failure(t)     ⇒ reject(DatabaseErrorRejection(t))
    }
  }
}
