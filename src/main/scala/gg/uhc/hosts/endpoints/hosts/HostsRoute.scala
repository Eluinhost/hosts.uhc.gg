package gg.uhc.hosts.endpoints.hosts

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class HostsRoute(getHostingHistory: GetHostingHistory) {
  def apply(): Route =
    (get & pathPrefix(Segment) & path("matches"))(getHostingHistory(_))
}
