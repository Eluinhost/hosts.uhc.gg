package gg.uhc.hosts.endpoints

import java.time.temporal.ChronoUnit
import java.time.{Instant, ZoneOffset}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import gg.uhc.hosts.Database.{DatabaseErrorRejection, requireSucessfulQuery}
import gg.uhc.hosts.Permissions.requirePermission
import gg.uhc.hosts.Session.requireValidSession
import gg.uhc.hosts._

object CreateMatch {
  import CustomJsonCodec._

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

  private[this] def validateAndConvertToRow(provided: CreateMatchModel, author: String): Directive1[MatchRow] = {
    var m = provided
      .copy(
        scenarios = provided.scenarios.groupBy(_.toLowerCase).map(_._2.head).toList, // remove duplicates
        tags = provided.tags.groupBy(_.toLowerCase).map(_._2.head).toList // remove duplicates
      )
      .toRow(author = author)

    if (m.opens.isBefore(Instant.now().plus(30, ChronoUnit.MINUTES)))
      return reject(ValidationRejection("Must be at least 30 minutes in advance"))

    if (m.opens.isAfter(Instant.now().plus(30, ChronoUnit.DAYS)))
      return reject(ValidationRejection("Must be at most 30 days in advance"))

    if (m.opens.atOffset(ZoneOffset.UTC).getMinute % 15 != 0)
      return reject(ValidationRejection("Minutes must be xx:00 xx:15 xx:30 or xx:45"))

    if ("""^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?$""".r.findFirstIn(m.ip).isEmpty)
      return reject(ValidationRejection("Invalid IP address supplied"))

    if (m.scenarios.isEmpty)
      return reject(ValidationRejection("Must supply at least 1 scenario"))

    if (m.scenarios.length > 25)
      return reject(ValidationRejection("Must supply at most 25 scenarios"))

    if (m.tags.length > 5)
      return reject(ValidationRejection("Must supply at most 5 tags"))

    if (!teamStyles.contains(m.teams))
      return reject(ValidationRejection("Unknown team style"))

    if (m.content.length == 0)
      return reject(ValidationRejection("Must provide some post content"))

    if (!regions.contains(m.region))
      return reject(ValidationRejection("Invalid region supplied"))

    val requiresSize = teamStyles(m.teams)

    if (requiresSize) {
      if (m.size.isEmpty) {
        return reject(ValidationRejection("Size is required for this team style"))
      }
    } else {
      m = m.copy(size = None) // remove size from data
    }

    if (m.teams == "custom") {
      if (m.customStyle.isEmpty) {
        return reject(ValidationRejection("A custom style must be given when 'custom' is picked"))
      }
    } else {
      m = m.copy(customStyle = None) // remove custom style
    }

    if (m.count < 1)
      return reject(ValidationRejection("Count must be at least 1"))

    // TODO check database for overhost conflicts

    provide(m)
  }

  private[this] def requireInsertMatch(m: MatchRow): Directive0 =
    requireSucessfulQuery(Database.insert(m)) flatMap {
      case 0 ⇒ reject(DatabaseErrorRejection(new IllegalStateException("no rows inserted")))
      case _ ⇒ pass
    }

  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireValidSession { session ⇒
        requirePermission("host", session.username) {
          // parse the entity
          entity(as[CreateMatchModel]) { entity ⇒
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
