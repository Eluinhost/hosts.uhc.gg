package gg.uhc.hosts.endpoints.modifiers

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class DeleteModifier(customDirectives: CustomDirectives, database: Database) {
  def apply(id: Int): Route =
    handleRejections(EndpointRejectionHandler()) {
      customDirectives.requireAuthentication { authentication =>
        customDirectives.requirePermission("hosting advisor", authentication.username) {
          customDirectives.requireSucessfulQuery(database.deleteModifier(id)) {
            case false => complete(StatusCodes.NotFound)
            case true => complete(StatusCodes.NoContent)
          }
        }
      }
    }
}
