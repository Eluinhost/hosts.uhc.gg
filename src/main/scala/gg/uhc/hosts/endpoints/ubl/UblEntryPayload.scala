package gg.uhc.hosts.endpoints.ubl

import java.time.Instant
import java.util.UUID

import akka.http.scaladsl.server.{Directive0, Directives}

// Used to both create and edit entries
case class UblEntryPayload(ign: String, uuid: UUID, reason: String, expires: Instant, link: String) {
  val requireValid: Directive0 =
    Directives.validate(link.nonEmpty, "Must provide a link to a courtroom post") &
      Directives.validate(ign.nonEmpty, "Must provide an IGN") &
      Directives.validate(reason.nonEmpty, "Must provide a reason")
}
