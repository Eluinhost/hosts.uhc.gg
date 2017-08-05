package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class ApproveMatch(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._

  def route(id: Int): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { authentication ⇒
        requirePermission("moderator", authentication.username) {
          requireSucessfulQuery(database.approveMatch(id, authentication.username)) {
            case false ⇒ complete(StatusCodes.NotFound) // None updated
            case _     ⇒ complete(StatusCodes.NoContent)
          }
        }
      }
    }
}
