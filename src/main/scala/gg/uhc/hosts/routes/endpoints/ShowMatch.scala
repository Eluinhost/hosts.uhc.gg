package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.database.Queries.MatchRow
import gg.uhc.hosts.routes.CustomDirectives
import gg.uhc.hosts.routes.endpoints.ListMatches.MatchRowResponse

import scalaz.OptionT

class ShowMatch(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def fetchData(id: Int): ConnectionIO[Option[MatchRowResponse]] =
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
        mapSizeX = row.mapSizeX,
        mapSizeZ = row.mapSizeZ,
        pvpEnabledAt = row.pvpEnabledAt,
        roles = perms
      )).run

  def route(id: Int): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(fetchData(id)) {
        case None    ⇒ complete(StatusCodes.NotFound)
        case Some(m) ⇒ complete(m)
      }
    }
}
