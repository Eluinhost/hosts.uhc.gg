package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
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

  val route: Route = path(IntNumber) { id ⇒
    handleRejections(EndpointRejectionHandler()) {
      Permissions.requirePermission("moderator") { session ⇒ // TODO also allow owner to use
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
