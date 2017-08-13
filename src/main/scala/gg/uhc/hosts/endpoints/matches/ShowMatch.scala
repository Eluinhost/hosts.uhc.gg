package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.JsonObject

import scalaz.OptionT

class ShowMatch(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def fetchData(id: Long): ConnectionIO[Option[JsonObject]] =
    (for {
      row ← OptionT[ConnectionIO, MatchRow] {
        database.matchById(id)
      }
      perms ← OptionT[ConnectionIO, List[String]] {
        database.getPermissions(row.author).map(Some(_))
      }
    } yield row.toJsonWithRoles(perms)).run

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(fetchData(id)) {
        case None    ⇒ complete(StatusCodes.NotFound)
        case Some(m) ⇒ complete(m)
      }
    }
}
