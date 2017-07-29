package gg.uhc.hosts.routes.endpoints

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

  private[this] val regions = List("NA", "SA", "AS", "EU", "AF", "OC")

  private[this] def validateAndConvertToRow(provided: CreateMatchPayload, author: String): Directive1[MatchRow] = {
    var row = MatchRow(
      address = provided.address,
      content = provided.content,
      count = provided.count,
      customStyle = provided.customStyle,
      ip = provided.ip,
      opens = provided.opens,
      region = provided.region,
      teams = provided.teams,
      size = provided.size,
      location = provided.location,
      version = provided.version,
      slots = provided.slots,
      length = provided.length,
      mapSizeX = provided.mapSizeX,
      mapSizeZ = provided.mapSizeZ,
      pvpEnabledAt = provided.pvpEnabledAt,
      scenarios = provided.scenarios.groupBy(_.toLowerCase).map(_._2.head).toList, // removes duplicates
      tags = provided.tags.groupBy(_.toLowerCase).map(_._2.head).toList,           // removes duplicates
      // non-user provided vars below
      id = -1,
      created = Instant.now(),
      author = author,
      removed = false,
      removedBy = None,
      removedReason = None
    )

    if (row.opens.isBefore(Instant.now().plus(30, ChronoUnit.MINUTES)))
      return reject(ValidationRejection("Must be at least 30 minutes in advance"))

    if (row.opens.isAfter(Instant.now().plus(30, ChronoUnit.DAYS)))
      return reject(ValidationRejection("Must be at most 30 days in advance"))

    if (row.opens.atOffset(ZoneOffset.UTC).getMinute % 15 != 0)
      return reject(ValidationRejection("Minutes must be xx:00 xx:15 xx:30 or xx:45"))

    if ("""^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$""".r.findFirstIn(row.ip).isEmpty)
      return reject(ValidationRejection("Invalid IP address supplied"))

    if (row.location.length == 0)
      return reject(ValidationRejection("Must supply a location"))

    if (row.version.length == 0)
      return reject(ValidationRejection("Must supply a version"))

    if (row.slots < 2)
      return reject(ValidationRejection("Slots must be at least 2"))

    if (row.length < 30)
      return reject(ValidationRejection("Matches must be at least 30 minutes"))

    if (row.mapSizeX < 0)
      return reject(ValidationRejection("X must be positive"))

    if (row.mapSizeZ < 0)
      return reject(ValidationRejection("Z must be positive"))

    if (row.pvpEnabledAt < 0)
      return reject(ValidationRejection("PVP enabled at must be positive"))

    if (row.scenarios.isEmpty)
      return reject(ValidationRejection("Must supply at least 1 scenario"))

    if (row.scenarios.length > 25)
      return reject(ValidationRejection("Must supply at most 25 scenarios"))

    if (row.tags.length > 5)
      return reject(ValidationRejection("Must supply at most 5 tags"))

    if (!teamStyles.contains(row.teams))
      return reject(ValidationRejection("Unknown team style"))

    if (row.content.length == 0)
      return reject(ValidationRejection("Must provide some post content"))

    if (!regions.contains(row.region))
      return reject(ValidationRejection("Invalid region supplied"))

    val requiresSize = teamStyles(row.teams)

    if (!requiresSize) {
      row = row.copy(size = None) // remove size from data
    } else if (row.size.isEmpty) {
      return reject(ValidationRejection("Size is required for this team style"))
    } else if (row.size.map(size ⇒ size < 1 || size > 32767).get) {
      return reject(ValidationRejection("Invalid value for size"))
    }

    if (row.teams == "custom") {
      if (row.customStyle.isEmpty) {
        return reject(ValidationRejection("A custom style must be given when 'custom' is picked"))
      }
    } else {
      row = row.copy(customStyle = None) // remove custom style
    }

    if (row.count < 1)
      return reject(ValidationRejection("Count must be at least 1"))

    // TODO check database for overhost conflicts

    provide(row)
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
            validateAndConvertToRow(entity, session.username) { validated ⇒
              requireInsertMatch(validated) {
                complete(StatusCodes.Created → validated)
              }
            }
          }
        }
      }
    }
}
