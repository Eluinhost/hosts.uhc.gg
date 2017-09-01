package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class AddPermission(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._

  def apply(username: String, permission: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireJwtAuthentication { session ⇒
        requirePermission("admin", session.username) {
          requireSucessfulQuery(database.addPermission(username, permission, session.username)) {
            case true  ⇒ complete(StatusCodes.Created)
            case false ⇒ complete(StatusCodes.BadRequest)
          }
        }
      }
    }
}
