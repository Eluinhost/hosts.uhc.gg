package gg.uhc.hosts

import akka.http.scaladsl.model.headers.HttpChallenges
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive0, Directive1}
import akka.http.scaladsl.server.Directives._

object Permissions {

  def requirePermission(permission: String): Directive1[Session] =
    Session.requireValidSession.flatMap { session ⇒
      Database.requireSucessfulQuery(Database.getPermissions(session.username)).flatMap {
        case l if l.contains(permission) ⇒
          provide(session)
        case _ ⇒
          reject(
            AuthenticationFailedRejection(
              AuthenticationFailedRejection.CredentialsRejected,
              HttpChallenges.basic("login")
            )
          )
      }
    }

}
