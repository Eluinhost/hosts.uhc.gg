package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class RemovePermission(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._

  def route(username: String, permission: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireJwtAuthentication { session ⇒
        requirePermission("moderator", session.username) {
          requireSucessfulQuery(database.removePermission(username, permission, session.username)) {
            case true  ⇒ complete(StatusCodes.NoContent)
            case false ⇒ complete(StatusCodes.BadRequest)
          }
        }
      }
    }
}
