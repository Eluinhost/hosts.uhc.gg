package gg.uhc.hosts.database

import java.time.Instant

case class HostApplicationRow(
    id: Long,
    username: String,
    created: Instant,
    status: String,
    reviewedBy: Option[String],
    reviewedAt: Option[Instant],
    reviewReason: Option[String])