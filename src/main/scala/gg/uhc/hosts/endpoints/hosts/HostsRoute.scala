package gg.uhc.hosts.endpoints.hosts

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route

class HostsRoute(getHostingHistory: GetHostingHistory) {
  def apply(): Route = (get & pathPrefix(Segment) & path("matches"))(getHostingHistory(_))
}
