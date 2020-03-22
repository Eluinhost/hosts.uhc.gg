package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class UsernameSearch(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def apply(username: String): Route = handleRejections(EndpointRejectionHandler()) {
    requireSucessfulQuery(database.searchUblUsername(username)) { map =>
      complete(map)
    }
  }
}
