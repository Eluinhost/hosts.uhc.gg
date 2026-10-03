package gg.uhc.hosts.endpoints.users

import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ShowPermissionsForUser(database: Database, customDirectives: CustomDirectives) {

  import CustomJsonCodec.*
  import customDirectives.*

  def apply(username: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getPermissions(username)) { result =>
        complete(result)
      }
    }
}
