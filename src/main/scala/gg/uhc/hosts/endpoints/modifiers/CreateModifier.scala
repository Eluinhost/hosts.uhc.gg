package gg.uhc.hosts.endpoints.modifiers

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.database.{Database, ModifierRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class CreateModifier(customDirectives: CustomDirectives, database: Database) {
  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      customDirectives.requireAuthentication { authentication =>
        customDirectives.requirePermission("hosting advisor", authentication.username) {
          entity(as[String]) { modifier =>
            customDirectives.requireSucessfulQuery(database.createModifier(modifier)) { id =>
              complete(StatusCodes.Created -> ModifierRow(id = id, displayName = modifier))
            }
          }
        }
      }
    }
}
