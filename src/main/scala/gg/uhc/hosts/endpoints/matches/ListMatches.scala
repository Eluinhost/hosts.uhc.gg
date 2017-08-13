package gg.uhc.hosts.endpoints.matches

import java.time.Instant

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import gg.uhc.hosts.endpoints.matches.ListMatches.MatchRowResponse

object ListMatches {
  case class MatchRowResponse(
      id: Long,
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
      roles: List[String],
      location: String,
      version: String,
      slots: Int,
      length: Int,
      mapSize: Int,
      pvpEnabledAt: Int,
      approvedBy: Option[String],
      hostingName: Option[String],
      tournament: Boolean)
}

class ListMatches(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def listingQuery: ConnectionIO[List[MatchRowResponse]] =
    for {
      matches ← database.listMatches
      perms   ← database.getPermissions(matches.map(_.author))
    } yield
      matches.map { row ⇒
        MatchRowResponse(
          id = row.id,
          author = row.author,
          opens = row.opens,
          address = row.address,
          ip = row.ip,
          scenarios = row.scenarios,
          tags = row.tags,
          teams = row.teams,
          size = row.size,
          customStyle = row.customStyle,
          count = row.count,
          content = row.content,
          region = row.region,
          removed = row.removed,
          removedBy = row.removedBy,
          removedReason = row.removedReason,
          created = row.created,
          location = row.location,
          version = row.version,
          slots = row.slots,
          length = row.length,
          mapSize = row.mapSize,
          pvpEnabledAt = row.pvpEnabledAt,
          approvedBy = row.approvedBy,
          roles = perms.getOrElse(row.author, List.empty),
          hostingName = row.hostingName,
          tournament = row.tournament
        )
      }

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(listingQuery) { items ⇒
        complete(items)
      }
    }
}
