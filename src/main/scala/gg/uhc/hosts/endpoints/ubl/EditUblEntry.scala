package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Directive1, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, UblRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class EditUblEntry(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def getExistingIfExists(id: Long): Directive1[UblRow] =
    requireSucessfulQuery(database.getUblEntry(id)).flatMap {
      case None      ⇒ complete(StatusCodes.NotFound)
      case Some(row) ⇒ provide(row)
    }

  def merge(existing: UblRow, edit: UblEntryPayload, username: String): UblRow = existing.copy(
    ign = edit.ign,
    uuid = edit.uuid,
    reason = edit.reason,
    expires = edit.expires,
    link = edit.link,
    createdBy = username,
    // skip created + id fields
  )

  // TODO apidocs
  def apply(id: Long): Route = handleRejections(EndpointRejectionHandler()) {
    requireAuthentication { session ⇒
      requirePermission("moderator", session.username) {
        entity(as[UblEntryPayload]) { entity ⇒
          getExistingIfExists(id) { existing ⇒
            val toUpdate = merge(existing, entity, session.username)

            requireSucessfulQuery(database.editUblEntry(toUpdate)) { _ ⇒
              complete(StatusCodes.OK)
            }
          }
        }
      }
    }
  }
}
