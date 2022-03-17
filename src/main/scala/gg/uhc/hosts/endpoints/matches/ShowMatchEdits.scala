package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie._
import doobie.free.connection.delay
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.JsonObject

import cats.data.OptionT

import CustomJsonCodec._

class ShowMatchEdits(directives: CustomDirectives, database: Database) {
  import directives._

  def getOriginalEdit(id: Long): ConnectionIO[Option[MatchRow]] = (for {
    fromId: MatchRow <- OptionT[ConnectionIO, MatchRow](database.getMatchById(id))
    original <- OptionT[ConnectionIO, MatchRow] {
      fromId.originalEditId
        // try grab the original if there is an ID
        .map(originalId => database.getMatchById(originalId))
        // if no ID was set then use the original row
        .getOrElse(delay(Some(fromId)))
    }
  } yield original).value

  def getEdits(id: Long): ConnectionIO[Option[List[JsonObject]]] =
    (for {
      original: MatchRow <- OptionT[ConnectionIO, MatchRow](getOriginalEdit(id))
      edits: List[MatchRow] <- OptionT.liftF(database.getMatchesByOriginalEditId(original.id))
      perms: List[String] <- OptionT.liftF(database.getPermissions(original.author)) // TODO fix if we're allowing edits by non-original authors
    } yield (List(original) ++ edits).map(_.toJsonWithRoles(perms))).value

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(getEdits(id)) {
        case None    => complete(StatusCodes.NotFound)
        case Some(m) => complete(m)
      }
    }
}
