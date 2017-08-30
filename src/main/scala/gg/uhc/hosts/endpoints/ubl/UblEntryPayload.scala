package gg.uhc.hosts.endpoints.ubl

import java.time.Instant
import java.util.UUID

// Used to both create and edit entries
case class UblEntryPayload(ign: String, uuid: UUID, reason: String, expires: Instant, link: String)
