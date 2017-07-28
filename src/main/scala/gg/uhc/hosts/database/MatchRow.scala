package gg.uhc.hosts.database

import java.time.Instant

case class MatchRow(
    id: Int,
    author: String,
    opens: Instant,
    address: Option[String],
    ip: String,
    scenarios: List[String],
    tags: List[String],
    teams: String,
    size: Option[Int],
    customStyle: Option[String],
    count: Int,
    content: String,
    region: String,
    removed: Boolean,
    removedBy: Option[String],
    removedReason: Option[String],
    created: Instant,
    location: String,
    version: String,
    slots: Int,
    length: Int,
    mapSizeX: Int,
    mapSizeZ: Int,
    pvpEnabledAt: Int)
