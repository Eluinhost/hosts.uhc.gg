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
    parameters(('after.as[Int].?, 'count ? 20)) { (after, count) ⇒
      // TODO limit count 1-50
      requireSucessfulQuery(database.getPermissionModerationLog(after, count)) { log ⇒
        complete(log)
      }
    }
}
