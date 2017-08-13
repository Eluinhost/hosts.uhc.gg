package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.matches.ListMatches.MatchRowResponse
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

import scalaz.OptionT

class ShowMatch(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def fetchData(id: Long): ConnectionIO[Option[MatchRowResponse]] =
    (for {
      row ← OptionT[ConnectionIO, MatchRow] {
        database.matchById(id)
      }
      perms ← OptionT[ConnectionIO, List[String]] {
        database.getPermissions(row.author).map(Some(_))
      }
    } yield
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
        roles = perms,
        hostingName = row.hostingName
      )).run

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(fetchData(id)) {
        case None    ⇒ complete(StatusCodes.NotFound)
        case Some(m) ⇒ complete(m)
      }
    }
}