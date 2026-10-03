package gg.uhc.hosts.endpoints.permissions

import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ListUsersInPermissionBeginningWith(customDirectives: CustomDirectives, database: Database) {

  import CustomJsonCodec.*
  import customDirectives.*

  def apply(permission: String, startsWith: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getUsersForPermissionStartingWithLetter(permission, startsWith)) { users =>
        complete(users)
      }
    }
}
