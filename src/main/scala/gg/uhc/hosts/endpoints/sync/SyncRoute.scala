package gg.uhc.hosts.endpoints.sync

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class SyncRoute(getTime: GetTime) {
  def apply(): Route =
    (get & pathEndOrSingleSlash)(getTime())
}
