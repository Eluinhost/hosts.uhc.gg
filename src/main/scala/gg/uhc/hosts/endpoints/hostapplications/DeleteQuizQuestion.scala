package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class DeleteQuizQuestion(database: Database, customDirectives: CustomDirectives) {
  import customDirectives._

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          requireSucessfulQuery(database.deleteQuizQuestion(id)) { _ =>
            complete(StatusCodes.NoContent)
          }
        }
      }
    }
}
