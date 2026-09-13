package gg.uhc.hosts.endpoints.rules

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route

class RulesRoute(getLatestRules: GetLatestRules, setRules: SetRules) {
  def apply(): Route =
    pathEndOrSingleSlash {
      concat(
        get(getLatestRules()),
        post(setRules())
      )
    }
}
