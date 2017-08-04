package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class GetLatestRules(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._
  import CustomJsonCodec._

  def route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getLatestRules) { rules ⇒
        complete(rules)
      }
    }
}