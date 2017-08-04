package gg.uhc.hosts.routes.endpoints

import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.time.{Instant, ZoneOffset}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import gg.uhc.hosts._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.database.MatchRow
import gg.uhc.hosts.routes.{CustomDirectives, DatabaseErrorRejection}

/**
  * Creates a new Match object. Requires login + 'host' permission
  */
class CreateMatch(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  case class CreateMatchPayload(
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
      location: String,
      version: String,
      slots: Int,
      length: Int,
      mapSizeX: Int,
      mapSizeZ: Int,
      pvpEnabledAt: Int)

  // map of style -> requires size
  private[this] val teamStyles: Map[String, Boolean] = Map(
    "ffa"      → false,
    "chosen"   → true,
    "random"   → true,
    "captains" → true,
    "picked"   → true,
    "market"   → true,
    "mystery"  → true,
    "rvb"      → false,
    "custom"   → false
  )

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
      size = if (teamStyles.getOrElse(payload.teams, false)) payload.size else None, // remove size if not required
      location = payload.location,
      version = payload.version,
      slots = payload.slots,
      length = payload.length,
      mapSizeX = payload.mapSizeX,
      mapSizeZ = payload.mapSizeZ,
      pvpEnabledAt = payload.pvpEnabledAt,
      scenarios = payload.scenarios.groupBy(_.toLowerCase).map(_._2.head).toList, // removes duplicates
      tags = payload.tags.groupBy(_.toLowerCase).map(_._2.head).toList,           // removes duplicates
      // non-user payload.vars below
      id = -1,
      created = Instant.now(),
      author = author,
      removed = false,
      removedBy = None,
      removedReason = None
    )

    // Automatically add the 'rush' scenario for games < 45 minutes long if it doesn't already have it
    if (row.length < 45 && !row.scenarios.exists(_.toLowerCase == "rush")) {
      row = row.copy(scenarios = row.scenarios :+ "Rush")
    }

    provide(row)
  }

  /**
    * Runs full validation of input payload including DB calls for overhost protection. Rejects with ValidationRejection
    * if something fails, otherwise payload.the validated MatchRow ready for inserting into the DB
    */
  private[this] def validateRow(row: MatchRow): Directive0 = {
    // Validation directives
    val validations =
      validate(
        row.opens.isAfter(Instant.now().plus(30, ChronoUnit.MINUTES)),
        "Must be at least 30 minutes in advance"
      ) &
        validate(row.opens.isBefore(Instant.now().plus(30, ChronoUnit.DAYS)), "Must be at most 30 days in advance") &
        validate(
          row.opens.atOffset(ZoneOffset.UTC).getMinute % 15 == 0,
          "Minutes must be on exactly xx:00 xx:15 xx:30 or xx:45 in an hour (UTC)"
        ) &
        validate(
          """^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$""".r.findFirstMatchIn(row.ip).exists { m ⇒
            val octets = (1 to 4).map(m.group).map(_.toInt).forall(i ⇒ i >= 0 && i <= 255)
            val port = Option(m.group(5)).map(_.toInt)

            octets && port.isEmpty || port.exists(p => p<= 65535 && p >= 1)
          },
          "Invalid IP address supplied"
        ) &
        validate(row.location.nonEmpty, "Must supply a location") &
        validate(row.version.nonEmpty, "Must supply a version") &
        validate(row.slots >= 2, "Slots must be at least 2") &
        validate(row.length >= 30, "Matches must be at least 30 minutes") &
        validate(row.mapSizeX > 0, "X must be positive") &
        validate(row.mapSizeZ > 0, "Z must be positive") &
        validate(row.pvpEnabledAt >= 0, "PVP enabled at must be positive") &
        validate(row.scenarios.nonEmpty, "Must supply at least 1 scenario") &
        validate(row.scenarios.length <= 25, "Must supply at most 25 scenarios") &
        validate(row.tags.length <= 5, "Must supply at most 5 tags") &
        validate(teamStyles.contains(row.teams), "Unknown team style") &
        validate(row.content.nonEmpty, "Must provide some post content") &
        validate(regions.contains(row.region), "Invalid region supplied") &
        validate(
          // either doesn't require size or size is within range
          !teamStyles(row.teams) || row.size.exists(size ⇒ size >= 1 && size <= 32767),
          "Invalid value for size"
        ) &
        validate(
          row.teams != "custom" || row.customStyle.exists(_.nonEmpty),
          "A custom style must be given when 'custom' is picked"
        ) &
        validate(row.count >= 1, "Count must be at least 1") &
        requireSucessfulQuery(database.getMatchesInDateRangeAndRegion(row.opens, row.opens, row.region))

    validations.flatMap {
      case conflicts if conflicts.isEmpty ⇒
        pass
      case _ ⇒
        val hours = row.opens.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("HH:mm"))

        reject(ValidationRejection(s"Conflicts with /u/${row.author}'s #${row.count} (${row.region} - $hours)"))
    }
  }

  private[this] def requireInsertMatch(m: MatchRow): Directive0 =
    requireSucessfulQuery(database.insertMatch(m)) flatMap {
      case 0 ⇒ reject(DatabaseErrorRejection(new IllegalStateException("no rows inserted")))
      case _ ⇒ pass
    }

  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session ⇒
        requirePermission("host", session.username) {
          // parse the entity
          entity(as[CreateMatchPayload]) { entity ⇒
            convertPayload(entity, session.username) { row ⇒
              (validateRow(row) & requireInsertMatch(row)) {
                complete(StatusCodes.Created → row)
              }
            }
          }
        }
      }
    }
}
