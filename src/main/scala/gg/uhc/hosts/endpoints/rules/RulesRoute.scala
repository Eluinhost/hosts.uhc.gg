package gg.uhc.hosts.endpoints.rules

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class RulesRoute(getLatestRules: GetLatestRules, setRules: SetRules) {
  def apply(): Route =
    pathEndOrSingleSlash {
      concat(
        get(getLatestRules()),
        post(setRules())
      )
    }
}
