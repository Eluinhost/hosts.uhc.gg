package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.HttpChallenges
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import gg.uhc.hosts._

case class DeleteMatch(reason: String)

object DeleteMatch {
  import CustomJsonCodec._

  def validate(data: DeleteMatch): Directive[Unit] = {
    if (data.reason.length == 0)
      return reject(ValidationRejection("Must provide a reason for deletion"))

    pass
  }

  def requireOwner(id: Long, username: String): Directive0 =
    Database.requireSucessfulQuery(Database.isOwner(id, username)) flatMap {
      case true ⇒
        pass
      case false ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsRejected,
            HttpChallenges.basic("login")
          )
        )
    }

  val route: Route = path(IntNumber) { id ⇒
    handleRejections(EndpointRejectionHandler()) {
      Session.requireValidSession { session ⇒
        (Permissions.requirePermission("moderator", session.username) | requireOwner(id, session.username)) {
          entity(as[DeleteMatch]) { data ⇒
            validate(data) {
              Database.requireSucessfulQuery(Database.remove(id, data.reason, session.username)) {
                case 0 ⇒ complete(StatusCodes.NotFound) // None updated
                case _ ⇒ complete(StatusCodes.NoContent)
              }
            }
          }
        }
      }
    }
  }
}
