package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.routes.CustomDirectives

class ListPermissions(customDirectives: CustomDirectives, database: Database) {
  import customDirectives._
  import CustomJsonCodec._

  def route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getAllPermissions) { perms ⇒
        complete(perms)
      }
    }
}
