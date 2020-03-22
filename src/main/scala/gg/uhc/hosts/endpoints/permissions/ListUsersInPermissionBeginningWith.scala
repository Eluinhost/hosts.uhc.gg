package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ListUsersInPermissionBeginningWith(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def apply(permission: String, startsWith: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getUsersForPermissionStartingWithLetter(permission, startsWith)) { users =>
        complete(users)
      }
    }
}
