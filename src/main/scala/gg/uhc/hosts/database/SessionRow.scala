package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant

case class SessionRow(
    id: String,
    username: String,
    created: Instant,
    lastSeen: Instant,
    lastRotated: Instant,
    absoluteExpiry: Instant,
    ip: Option[InetAddress],
    userAgent: Option[String]
)

case class CreatedSession(id: String, expiresAt: Instant)

case class LiveSession(
    id: String,
    username: String,
    permissions: List[String],
    lastSeen: Instant,
    lastRotated: Instant,
    absoluteExpiry: Instant
)
