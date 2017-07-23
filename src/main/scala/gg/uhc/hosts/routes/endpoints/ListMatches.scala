package gg.uhc.hosts.routes.endpoints

import java.time.Instant

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class ListMatches(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class MatchRowResponse(
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
      roles: List[String],
      location: String,
      version: String,
      slots: Int,
      length: Int,
      mapSizeX: Int,
      mapSizeZ: Int,
      pvpEnabledAt: Int)

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
          mapSizeX = row.mapSizeX,
          mapSizeZ = row.mapSizeZ,
          pvpEnabledAt = row.pvpEnabledAt,
          roles = perms.getOrElse(row.author, List.empty)
        )
      }

  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(listingQuery) { items ⇒
        complete(items)
      }
    }
}
