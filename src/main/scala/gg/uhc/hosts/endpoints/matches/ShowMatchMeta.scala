package gg.uhc.hosts.endpoints.matches

import scala.util.Success

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.database.Database

class ShowMatchMeta(database: Database) {

  def apply(id: Long): Route =
    onComplete(database.run(database.matchById(id))) {
      case Success(Some(m)) => complete(m.legacyTitle())
      case _                => complete("")
    }
}
