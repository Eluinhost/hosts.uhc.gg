package gg.uhc.hosts.endpoints.modifiers

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec.*
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
