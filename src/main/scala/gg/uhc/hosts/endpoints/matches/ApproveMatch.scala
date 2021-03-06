package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, EndpointRejectionHandler}

class ApproveMatch(customDirectives: CustomDirectives, database: Database, cache: BasicCache) {
  import customDirectives._

  def apply(id: Int): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { authentication =>
        requirePermission("hosting advisor", authentication.username) {
          requireSucessfulQuery(database.approveMatch(id, authentication.username)) {
            case false => complete(StatusCodes.NotFound) // None updated
            case _     =>
              cache.invalidateUpcomingMatches()
              complete(StatusCodes.OK)
          }
        }
      }
    }
}
