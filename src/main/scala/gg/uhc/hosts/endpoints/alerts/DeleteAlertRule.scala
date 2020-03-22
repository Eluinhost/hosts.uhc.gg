package gg.uhc.hosts.endpoints.alerts

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class DeleteAlertRule(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          requireSucessfulQuery(database.deleteAlertRule(id)) {
            case 0 => complete(StatusCodes.NotFound) // None updated
            case _ => complete(StatusCodes.NoContent)
          }
        }
      }
    }
}
