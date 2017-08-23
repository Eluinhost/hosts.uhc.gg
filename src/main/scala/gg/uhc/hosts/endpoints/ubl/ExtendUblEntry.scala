package gg.uhc.hosts.endpoints.ubl

import java.time.Instant

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ExtendUblEntry(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class ExtendUblEntryPayload(reason: String, newExpires: Instant)

  // TODO apidocs
  def apply(id: Long): Route = handleRejections(EndpointRejectionHandler()) {
    requireAuthentication { session ⇒
      requirePermission("moderator", session.username) {
        entity(as[ExtendUblEntryPayload]) { entity ⇒
          validate(entity.reason.length > 3, "Reason must be at least 3 characters") {
            requireSucessfulQuery(database.extendUblEntry(id, session.username, entity.reason, entity.newExpires)) {
              case false ⇒ complete(StatusCodes.NotFound)
              case true  ⇒ complete(StatusCodes.OK)
            }
          }
        }
      }
    }
  }

}
