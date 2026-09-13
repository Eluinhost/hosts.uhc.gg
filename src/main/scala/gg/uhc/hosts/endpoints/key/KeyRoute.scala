package gg.uhc.hosts.endpoints.key

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route

class KeyRoute(getApiKey: GetApiKey, regenerateApiKey: RegenerateApiKey) {
  def apply(): Route =
    pathEndOrSingleSlash {
      concat(
        get(getApiKey()),
        post(regenerateApiKey())
      )
    }
}
