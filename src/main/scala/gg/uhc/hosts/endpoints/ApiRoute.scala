package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.endpoints.docs.DocsRoute
import gg.uhc.hosts.endpoints.hosts.HostsRoute
import gg.uhc.hosts.endpoints.key.KeyRoute
import gg.uhc.hosts.endpoints.matches.MatchesRoute
import gg.uhc.hosts.endpoints.permissions.PermissionsRoute
import gg.uhc.hosts.endpoints.rules.RulesRoute
import gg.uhc.hosts.endpoints.sync.SyncRoute

class ApiRoute(
    syncRoute: SyncRoute,
    rulesRoute: RulesRoute,
    matchesRoute: MatchesRoute,
    permissionsRoute: PermissionsRoute,
    keyRoute: KeyRoute,
    docsRoute: DocsRoute,
    hostsRoute: HostsRoute) {

  def apply(): Route =
    respondWithHeader(`Access-Control-Allow-Origin`.*) {
      concat(
        pathPrefix("sync")(syncRoute()),
        pathPrefix("rules")(rulesRoute()),
        pathPrefix("matches")(matchesRoute()),
        pathPrefix("hosts")(hostsRoute()),
        pathPrefix("permissions")(permissionsRoute()),
        pathPrefix("key")(keyRoute()),
        pathPrefix("docs")(docsRoute())
      ) ~ complete(StatusCodes.NotFound)
    }

}
