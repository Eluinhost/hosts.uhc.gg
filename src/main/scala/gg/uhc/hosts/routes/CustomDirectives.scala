package gg.uhc.hosts.routes

import akka.http.scaladsl.model.headers.{Authorization, HttpChallenges, OAuth2BearerToken}
import akka.http.scaladsl.server.Directives.{onComplete, optionalHeaderValuePF, pass, provide, reject}
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive0, Directive1}
import doobie.imports._
import gg.uhc.hosts.authentication.Session.{Authenticated, RefreshToken}
import gg.uhc.hosts.database.Database

import scala.util.{Failure, Success}

class CustomDirectives(database: Database) {
  def checkHasPermission(permission: String, username: String): Directive1[Boolean] =
    requireSucessfulQuery(database.getPermissions(username)).flatMap {
      case l if l.contains(permission) ⇒ provide(true)
      case _                           ⇒ provide(false)
    }

  def requirePermission(permission: String, username: String): Directive0 =
    checkHasPermission(permission, username) flatMap {
      case true ⇒ pass
      case false ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsRejected,
            HttpChallenges.basic("login")
          )
        )
    }

  /**
    * Checks for an OAuth2 bearer token header with a valid non-expired JWT token.
    */
  val optionalAuthentication: Directive1[Option[Authenticated]] =
    optionalHeaderValuePF {
      case Authorization(OAuth2BearerToken(token)) ⇒ token
    } flatMap { maybeToken ⇒
      provide(maybeToken.flatMap(Authenticated.fromJwt))
    }

  /**
    * Rejects with authentication failed reject if header missing or invalid JWT token
    */
  val requireAuthentication: Directive1[Authenticated] =
    optionalAuthentication.flatMap {
      case Some(token) ⇒
        provide(token)
      case None ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("login")
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
            HttpChallenges.basic("login")
          )
        )
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
