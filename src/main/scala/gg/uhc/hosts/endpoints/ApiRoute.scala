package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.endpoints.alerts.AlertsRoute
import gg.uhc.hosts.endpoints.docs.DocsRoute
import gg.uhc.hosts.endpoints.hosts.HostsRoute
import gg.uhc.hosts.endpoints.key.KeyRoute
import gg.uhc.hosts.endpoints.matches.MatchesRoute
import gg.uhc.hosts.endpoints.permissions.PermissionsRoute
import gg.uhc.hosts.endpoints.rules.RulesRoute
import gg.uhc.hosts.endpoints.sync.SyncRoute
import gg.uhc.hosts.endpoints.ubl.UblRoute
import gg.uhc.hosts.endpoints.users.UsersRoute

class ApiRoute(
    syncRoute: SyncRoute,
    rulesRoute: RulesRoute,
    matchesRoute: MatchesRoute,
    permissionsRoute: PermissionsRoute,
    keyRoute: KeyRoute,
    docsRoute: DocsRoute,
    hostsRoute: HostsRoute,
    ublRoute: UblRoute,
    alertsRoute: AlertsRoute,
    usersRoute: UsersRoute)
    extends Instrumented {

  private[this] val apiTimer = metrics.timer("api-request-time")
  private[this] val apiRequests = metrics.counter("api-request-count")

  def apply(): Route =
    (timed(apiTimer) & counting(apiRequests)) {
      respondWithHeader(`Access-Control-Allow-Origin`.*) {
        concat(
          pathPrefix("sync")(syncRoute()),
          pathPrefix("ubl")(ublRoute()),
          pathPrefix("rules")(rulesRoute()),
          pathPrefix("matches")(matchesRoute()),
          pathPrefix("hosts")(hostsRoute()),
          pathPrefix("permissions")(permissionsRoute()),
          pathPrefix("key")(keyRoute()),
          pathPrefix("docs")(docsRoute()),
          pathPrefix("alerts")(alertsRoute()),
          pathPrefix("users")(usersRoute())
        ) ~ complete(StatusCodes.NotFound)
      }
    }
}
