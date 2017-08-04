package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class PermissionModerationLog(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def route: Route =
    parameters(('before.as[Int].?, 'count ? 20)) { (before, count) ⇒
      handleRejections(EndpointRejectionHandler()) {
        validate(count >= 1 && count <= 50, "Count must be between 1-50") {
          requireSucessfulQuery(database.getPermissionModerationLog(before, count)) { log ⇒
            complete(log)
          }
        }
      }
    }
}
