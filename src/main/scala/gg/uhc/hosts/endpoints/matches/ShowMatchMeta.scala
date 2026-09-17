package gg.uhc.hosts.endpoints.matches

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.database.Database

import scala.util.Success

class ShowMatchMeta(database: Database) {

  def apply(id: Long): Route =
    onComplete(database.run(database.matchById(id))) {
      case Success(Some(m)) => complete(m.legacyTitle())
      case _                => complete("")
    }
}
