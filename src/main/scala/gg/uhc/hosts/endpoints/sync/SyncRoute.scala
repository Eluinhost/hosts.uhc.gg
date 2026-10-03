package gg.uhc.hosts.endpoints.sync

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route

class SyncRoute(getTime: GetTime) {
  def apply(): Route = (get & pathEndOrSingleSlash)(getTime())
}
