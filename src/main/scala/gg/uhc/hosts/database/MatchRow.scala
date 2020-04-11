package gg.uhc.hosts.database

import java.time.format.DateTimeFormatter
import java.time.{Instant, ZoneOffset}

import gg.uhc.hosts.{CustomTeamStyle, SimpleTeamStyle, SizedTeamStyle, TeamStyles}

object MatchModifiers {
  val allowed: Set[String] = Set("CutClean", "Fast Smelting", "Beta Zombies", "Hasty Boys", "Veinminer", "Timber")
}

case class MatchRow(
    id: Long,
    author: String,
    opens: Instant,
    address: Option[String],
    ip: Option[String],
    modifiers: List[String],
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
    mapSize: Int,
    pvpEnabledAt: Int,
    approvedBy: Option[String],
    hostingName: Option[String],
    tournament: Boolean) {

  def renderStyle(): String = TeamStyles.byCode(teams) match {
    case t: SimpleTeamStyle => t.render()
    case t: SizedTeamStyle  => t.render(size.get)
    case CustomTeamStyle    => CustomTeamStyle.render(customStyle.get)
  }

  def legacyTitle(): String = {
    val time = opens.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("MMM dd HH:mm"))
    val name = hostingName.getOrElse(author)
    val style = renderStyle()
    val scenarioString = modifiers.concat(scenarios).mkString(", ")
    val tagString = tags.map(t => s"[$t]").mkString("")

    s"$time UTC $region - $name's #$count - $style - $scenarioString $tagString"
  }
}
