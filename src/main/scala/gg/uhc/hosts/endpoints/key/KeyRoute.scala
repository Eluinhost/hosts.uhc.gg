package gg.uhc.hosts.endpoints.key

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class KeyRoute(getApiKey: GetApiKey, regenerateApiKey: RegenerateApiKey) {
  def apply(): Route =
    pathEndOrSingleSlash {
      concat(
        get(getApiKey()),
        post(regenerateApiKey())
      )
    }
}
