package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class RemovePermission(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._

  def apply(username: String, permission: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireJwtAuthentication { session =>
        // get permissions for requester
        requireSucessfulQuery(database.getPermissions(session.username)) { userPermissions =>
          // check they can actual do this
          Permissions.requireCanModifyPermission(userPermissions, permission) {
            requireSucessfulQuery(database.removePermission(username, permission, session.username)) {
              case true  => complete(StatusCodes.NoContent)
              case false => complete(StatusCodes.BadRequest)
            }
          }
        }
      }
    }
}
