package gg.uhc.hosts.database

import java.time.Instant
import java.util.UUID

case class UblRow(
    id: Long,
    ign: String,
    uuid: UUID,
    reason: String,
    created: Instant,
    expires: Option[Instant],
    link: String,
    createdBy: String)
