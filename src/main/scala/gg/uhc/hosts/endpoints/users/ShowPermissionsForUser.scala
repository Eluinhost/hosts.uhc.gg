package gg.uhc.hosts.endpoints.users

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import doobie._

import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ShowPermissionsForUser(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  def listPermissionsForUser(username: String): ConnectionIO[List[String]] =
    database.getPermissions(username)

  def apply(username: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getPermissions(username)) { result =>
        complete(result)
      }
    }
}
