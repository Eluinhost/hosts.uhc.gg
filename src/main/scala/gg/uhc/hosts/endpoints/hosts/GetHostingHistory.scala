package gg.uhc.hosts.endpoints.hosts

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetHostingHistory(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  def apply(host: String): Route =
    parameters(('before.as[Long].?, 'count ? 20)) { (before, count) ⇒
      handleRejections(EndpointRejectionHandler()) {
        validate(count >= 1 && count <= 50, "Count must be between 1-50") {
          requireSucessfulQuery(database.getHostingHistory(host, before, count)) { history ⇒
            requireSucessfulQuery(database.getPermissions(host)) { roles ⇒
              complete(history.map(_.toJsonWithRoles(roles)))
            }
          }
        }
      }
    }
}
