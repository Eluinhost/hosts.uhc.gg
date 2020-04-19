package gg.uhc.hosts.database

import java.time.format.DateTimeFormatter
import java.time.{Instant, ZoneOffset}

import gg.uhc.hosts.{CustomTeamStyle, SimpleTeamStyle, SizedTeamStyle, TeamStyles}

case class MatchRow(
    id: Long,
    author: String,
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
    removed: Boolean,
    removedBy: Option[String],
    removedReason: Option[String],
    created: Instant,
    location: String,
    mainVersion: String,
    version: String,
    slots: Int,
    length: Int,
    mapSize: Int,
    pvpEnabledAt: Int,
    approvedBy: Option[String],
    hostingName: Option[String],
    tournament: Boolean,
    originalEditId: Option[Long],
    previousEditId: Option[Long],
    nextEditId: Option[Long]) {

  def renderStyle(): String = TeamStyles.byCode(teams) match {
    case t: SimpleTeamStyle => t.render()
    case t: SizedTeamStyle  => t.render(size.get)
    case CustomTeamStyle    => CustomTeamStyle.render(customStyle.get)
  }

  def legacyTitle() =
    s"${opens.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("MMM dd HH:mm"))} UTC $region - ${hostingName.getOrElse(
      author)}'s #$count - ${renderStyle()} - ${scenarios.mkString(", ")} ${tags.map(t => s"[$t]").mkString("")}"
}
