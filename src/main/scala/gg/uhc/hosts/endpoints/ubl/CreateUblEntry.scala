package gg.uhc.hosts.endpoints.ubl

import java.time.Instant
import java.util.UUID

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server.{Directive1, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, UblRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class CreateUblEntry(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class CreateUblEntryPayload(ign: String, uuid: UUID, reason: String, expires: Instant, link: String)

  private[this] def convertPayload(payload: CreateUblEntryPayload, username: String): Directive1[UblRow] =
    provide(
      UblRow(
        id = -1,
        ign = payload.ign,
        uuid = payload.uuid,
        reason = payload.reason,
        created = Instant.now(),
        expires = payload.expires,
        link = payload.link,
        createdBy = username
      )
    )

  def apply(): Route = handleRejections(EndpointRejectionHandler()) {
    requireAuthentication { session ⇒
      requirePermission("moderator", session.username) {
        entity(as[CreateUblEntryPayload]) { entity ⇒
          convertPayload(entity, session.username) { row ⇒
            requireSucessfulQuery(database.createUblEntry(row)) { id ⇒
              complete(StatusCodes.Created → row.copy(id = id))
            }
          }
        }
      }
    }
  }
}
