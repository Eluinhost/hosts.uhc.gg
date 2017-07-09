package gg.uhc.hosts

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
    created: Instant)

case class CreateMatchModel(
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
    region: String) {

  def toRow(author: String) = MatchRow(
    id = -1,
    author = author,
    removed = false,
    removedBy = None,
    removedReason = None,
    opens = opens,
    address = address,
    ip = ip,
    scenarios = scenarios,
    tags = tags,
    teams = teams,
    size = size,
    customStyle = customStyle,
    count = count,
    content = content,
    region = region,
    created = Instant.now()
  )
}
