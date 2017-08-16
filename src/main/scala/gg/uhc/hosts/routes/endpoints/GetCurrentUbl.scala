package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class GetCurrentUbl(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def route: Route = handleRejections(EndpointRejectionHandler()) {
    requireSucessfulQuery(database.getCurrentUbl) { ubl ⇒
      complete(ubl)
    }
  }
}
