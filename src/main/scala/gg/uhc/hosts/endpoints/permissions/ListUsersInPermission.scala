package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import doobie.imports.ConnectionIO
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import doobie.free.connection.delay

class ListUsersInPermission(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  // returns a list of usernames if <= 30 are available, otherwise shows a map of first letter to count
  def listUsersInPermission(permission: String): ConnectionIO[Either[List[String], Map[String, Int]]] =
    database.getAllUsersForPermission(permission, 31).flatMap {
      case list if list.length == 31 ⇒
        database.getUserCountForPermissionByFirstLetter(permission).map(Right(_))
      case list ⇒
        delay(Left(list))
    }

  def apply(permission: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(listUsersInPermission(permission)) { result ⇒
        complete(result)
      }
    }
}
