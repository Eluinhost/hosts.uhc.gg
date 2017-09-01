package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.JsonObject

class ListUpcomingMatches(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def listingQuery: ConnectionIO[List[JsonObject]] =
    for {
      matches ← database.getUpcomingMatches
      perms   ← database.getPermissions(matches.map(_.author))
    } yield matches.map(row ⇒ row.toJsonWithRoles(perms.getOrElse(row.author, List.empty)))

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(listingQuery) { items ⇒
        complete(items)
      }
    }
}
