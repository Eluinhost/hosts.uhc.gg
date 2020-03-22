package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, EndpointRejectionHandler}

class DeleteUblEntry(directives: CustomDirectives, database: Database, cache: BasicCache) {
  import directives._

  def apply(id: Long): Route = handleRejections(EndpointRejectionHandler()) {
    requireAuthentication { session =>
      requirePermission("ubl moderator", session.username) {
        requireSucessfulQuery(database.deleteUblEntry(id)) {
          case false => complete(StatusCodes.NotFound)
          case true =>
            cache.invalidateCurrentUbl()
            complete(StatusCodes.NoContent)
        }
      }
    }
  }

}
