package gg.uhc.hosts.endpoints.matches

import java.time.Instant

case class CreateMatchPayload(
    originalEditId: Option[Long],
    opens: Instant,
    address: Option[String],
    ip: Option[String],
    scenarios: List[String],
    tags: List[String],
    teams: String,
    size: Option[Int],
    customStyle: Option[String],
    count: Int,
    content: String,
    region: String,
    location: String,
    mainVersion: String,
    version: String,
    slots: Int,
    length: Int,
    mapSize: Int,
    pvpEnabledAt: Int,
    hostingName: Option[String],
    tournament: Boolean)
