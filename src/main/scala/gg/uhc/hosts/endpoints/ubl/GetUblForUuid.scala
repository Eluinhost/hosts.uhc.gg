package gg.uhc.hosts.endpoints.ubl

import java.util.UUID

import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetUblForUuid(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def apply(uuid: UUID): Route = handleRejections(EndpointRejectionHandler()) {
    requireSucessfulQuery(database.getUblEntriesForUuid(uuid)) { ubl =>
      complete(ubl)
    }
  }
}
