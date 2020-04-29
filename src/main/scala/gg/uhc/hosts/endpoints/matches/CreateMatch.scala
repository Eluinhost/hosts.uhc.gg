package gg.uhc.hosts.endpoints.matches

import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.time.{Instant, ZoneOffset}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import gg.uhc.hosts._
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, EndpointRejectionHandler}
import doobie.free.connection.delay
import doobie._
import gg.uhc.hosts.endpoints.matches.websocket.MatchesWebsocket
import gg.uhc.hosts.endpoints.versions.Version

/**
  * Creates a new Match object. Requires login + 'host' permission
  */
class CreateMatch(customDirectives: CustomDirectives, database: Database, cache: BasicCache, websocket: MatchesWebsocket) {
  import Alerts._
  import CustomJsonCodec._
  import customDirectives._

  case class CreateMatchPayload(
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

  // allowed regions
  private[this] val regions = List("NA", "SA", "AS", "EU", "AF", "OC")

  /**
    * Converts the payload into an insertable MatchRow, does not validate any input
    */
  private[this] def convertPayload(payload: CreateMatchPayload, author: String): Directive1[MatchRow] = {
    var row = MatchRow(
      address = payload.address,
      content = payload.content,
      count = payload.count,
      customStyle = if (payload.teams == "custom") payload.customStyle else None, // remove if not custom
      ip = payload.ip,
      // Replace time with the UTC offset and set everything sub-minute accuracy to 0
      opens = payload.opens.atOffset(ZoneOffset.UTC).withSecond(0).withNano(0).toInstant,
      region = payload.region,
      teams = payload.teams,
      size = if (TeamStyles.byCode.get(payload.teams).exists(_.isInstanceOf[SizedTeamStyle])) payload.size else None, // remove size if not required
      location = payload.location,
      mainVersion = payload.mainVersion,
      version = payload.version,
      slots = payload.slots,
      length = payload.length,
      mapSize = payload.mapSize,
      pvpEnabledAt = payload.pvpEnabledAt,
      scenarios = payload.scenarios.distinctBy(_.toLowerCase), // removes duplicates
      tags = payload.tags.distinctBy(_.toLowerCase), // removes duplicates
      tournament = payload.tournament,
      // non-user payload.vars below
      id = -1,
      created = Instant.now(),
      author = author,
      removed = false,
      removedBy = None,
      removedReason = None,
      approvedBy = None,
      hostingName = payload.hostingName.filter(!_.isEmpty),
      originalEditId = None,
      latestEditId = None
    )

    // Automatically add the 'rush' scenario for games < 45 minutes long if it doesn't already have it and isn't a tournament
    if (!row.tournament && row.length < 45 && !row.scenarios.exists(_.toLowerCase == "rush")) {
      row = row.copy(scenarios = row.scenarios :+ "Rush")
    }

    provide(row)
  }

  private[this] def overhostCheck(row: MatchRow): Directive0 =
    requireSucessfulQuery(
      database.getPotentialConflicts(start = row.opens, end = row.opens, version = row.version, region = row.region)
    ) flatMap {
      // Its valid if:
      //  - there are no conflicts
      //  - this is a non-tournament and conflicts are all tournaments
      case conflicts if conflicts.isEmpty =>
        pass
      case conflicts if !row.tournament && conflicts.forall(_.tournament) =>
        pass
      case conflicts =>
        val hours = row.opens.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("HH:mm"))

        // Try to find a non-tournament to tell, otherwise just give whatever was returned first
        val best = conflicts.find(!_.tournament).getOrElse(conflicts.head)

        reject(ValidationRejection(s"Conflicts with /u/${best.author}'s #${best.count} (${best.region} - $hours) in ${best.mainVersion}"))
    }

  private[this] def optionalValidate[T](data: Option[T], message: String)(p: T => Boolean) =
    data
      .map { item =>
        validate(p(item), message)
      }
      .getOrElse(pass)

  private[this] def ipChecks(row: MatchRow): Directive0 = {
    // treat empty strings as non-provided
    val valIp      = row.ip.filter(_.nonEmpty)
    val valAddress = row.address.filter(_.nonEmpty)

    if (valIp.isEmpty && valAddress.isEmpty)
      reject(ValidationRejection("Either an IP or an address must be provided (or both)"))

    val ipCheck = optionalValidate(valIp, "Invalid IP supplied, expected format 111.222.333.444[:55555]") { ip =>
      """^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$""".r.findFirstMatchIn(ip).exists { m =>
        val octets = (1 to 4).map(m.group(_).toInt).forall(i => i >= 0 && i <= 255)
        val port   = Option(m.group(5)).map(_.toInt)

        octets && (port.isEmpty || port.exists(p => p <= 65535 && p >= 1))
      }
    }

    val addressCheck = optionalValidate(valAddress.map(_.trim), "Address must be at least 5 chars") { address =>
      address.length >= 5
    }

    ipCheck & addressCheck
  }

  /**
    * Runs full validation of input payload including DB calls for overhost protection. Rejects with ValidationRejection
    * if something fails, otherwise payload.the validated MatchRow ready for inserting into the DB
    */
  private[this] def validateRow(row: MatchRow): Directive0 =
    validate(
      row.opens.isAfter(Instant.now().plus(30, ChronoUnit.MINUTES)),
      "Must be at least 30 minutes in advance"
    ) &
      validate(row.opens.isBefore(Instant.now().plus(30, ChronoUnit.DAYS)), "Must be at most 30 days in advance") &
      validate(
        row.opens.atOffset(ZoneOffset.UTC).getMinute % 15 == 0,
        "Minutes must be on exactly xx:00 xx:15 xx:30 or xx:45 in an hour (UTC)"
      ) &
      ipChecks(row) &
      validate(row.location.nonEmpty, "Must supply a location") &
      validate(
        Version.options.exists(v => v.displayName == row.mainVersion),
        s"Invalid main version, expected one of: ${Version.options.map(v => v.displayName).mkString(", ")}"
      ) &
      validate(row.version.nonEmpty, "Must supply a version") &
      validate(row.slots >= 2, "Slots must be at least 2") &
      validate(row.length >= 30, "Matches must be at least 30 minutes") &
      validate(row.mapSize > 0, "Map size must be positive") &
      validate(row.pvpEnabledAt >= 0, "PVP enabled at must be positive") &
      validate(row.scenarios.nonEmpty, "Must supply at least 1 scenario") &
      validate(row.scenarios.length <= 25, "Must supply at most 25 scenarios") &
      validate(row.tags.length <= 5, "Must supply at most 5 tags") &
      validate(TeamStyles.byCode.contains(row.teams), "Unknown team style") &
      validate(row.content.nonEmpty, "Must provide some post content") &
      validate(regions.contains(row.region), "Invalid region supplied") &
      validate(
        // either doesn't require size or size is within range
        !TeamStyles.byCode(row.teams).isInstanceOf[SizedTeamStyle]
          || row.size.exists(size => size >= 0 && size <= 32767),
        "Invalid value for size"
      ) &
      validate(
        row.teams != "custom" || row.customStyle.exists(_.nonEmpty),
        "A custom style must be given when 'custom' is picked"
      ) &
      validate(row.count >= 1, "Count must be at least 1") &
      overhostCheck(row)

  private[this] def createMatchAndAlerts(row: MatchRow): ConnectionIO[MatchRow] =
    for {
      id       <- database.insertMatch(row)
      allRules <- database.getAllAlertRules()
      matchedRules = allRules.filter { _.matchesRow(row) }
      addedAlertCount <- matchedRules.foldLeft(delay(0)) { (prev, rule) => // reduce to run each in series, one for each alert
        prev.flatMap { count =>
          database.createAlert(matchId = id, triggeredRuleId = rule.id).map(_ + count)
        }
      }
    } yield row.copy(id = id)

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requireAtLeastOnePermission("host" :: "trial host" :: Nil, session.username) {
          // parse the entity
          entity(as[CreateMatchPayload]) { entity =>
            convertPayload(entity, session.username) { row =>
              validateRow(row) {
                requireSucessfulQuery(createMatchAndAlerts(row)) { inserted =>
                  cache.invalidateUpcomingMatches()
                  websocket.notifyMatchCreated(inserted)
                  complete(StatusCodes.Created -> inserted)
                }
              }
            }
          }
        }
      }
    }
}
