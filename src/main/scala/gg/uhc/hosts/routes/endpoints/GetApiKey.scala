package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class GetApiKey(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class Response(key: Option[String])

  def route: Route = handleRejections(EndpointRejectionHandler()) {
    requireAuthentication { authentication ⇒
      requireSucessfulQuery(database.getUserApiKey(authentication.username)) { key ⇒
        complete(Response(key))
      }
    }
  }

}
