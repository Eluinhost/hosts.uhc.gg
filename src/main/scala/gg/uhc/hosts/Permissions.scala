package gg.uhc.hosts

import akka.http.scaladsl.model.headers.HttpChallenges
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive0, Directive1}
import akka.http.scaladsl.server.Directives._

object Permissions {
  def checkHasPermission(permission: String, username: String): Directive1[Boolean] =
    Database.requireSucessfulQuery(Database.getPermissions(username)).flatMap {
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
}
