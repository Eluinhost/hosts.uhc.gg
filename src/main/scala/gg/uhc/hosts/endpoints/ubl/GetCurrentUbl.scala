package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetCurrentUbl(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def apply(): Route = handleRejections(EndpointRejectionHandler()) {
    requireSucessfulQuery(database.getCurrentUbl) { ubl ⇒
      complete(ubl)
    }
  }
}
