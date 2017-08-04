package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{as, complete, entity, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class SetRules(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session ⇒
        requirePermission("moderator", session.username) {
          entity(as[String]) { entity ⇒
            requireSucessfulQuery(database.setRules(author = session.username, content = entity)) { _ ⇒
              complete(StatusCodes.Created)
            }
          }
        }
      }
    }
}
