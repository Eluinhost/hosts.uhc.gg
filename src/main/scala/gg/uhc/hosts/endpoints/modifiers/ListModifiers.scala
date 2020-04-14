package gg.uhc.hosts.endpoints.modifiers

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ListModifiers(customDirectives: CustomDirectives, database: Database) {
  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      customDirectives.requireSucessfulQuery(database.getAllModifiers()) { modifiers =>
        complete(modifiers)
      }
    }
}
