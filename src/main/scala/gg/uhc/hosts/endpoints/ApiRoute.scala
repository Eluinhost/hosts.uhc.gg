package gg.uhc.hosts.endpoints

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.endpoints.authentication.Me
import gg.uhc.hosts.endpoints.docs.DocsRoute
import gg.uhc.hosts.endpoints.hostapplications.{HostApplicationsRoute, QuizRoute}
import gg.uhc.hosts.endpoints.hosts.HostsRoute
import gg.uhc.hosts.endpoints.key.KeyRoute
import gg.uhc.hosts.endpoints.matches.MatchesRoute
import gg.uhc.hosts.endpoints.modifiers.ModifiersRoute
import gg.uhc.hosts.endpoints.permissions.PermissionsRoute
import gg.uhc.hosts.endpoints.rules.RulesRoute
import gg.uhc.hosts.endpoints.sync.SyncRoute
import gg.uhc.hosts.endpoints.users.UsersRoute

class ApiRoute(
    customDirectives: CustomDirectives,
    syncRoute: SyncRoute,
    rulesRoute: RulesRoute,
    matchesRoute: MatchesRoute,
    permissionsRoute: PermissionsRoute,
    keyRoute: KeyRoute,
    docsRoute: DocsRoute,
    hostsRoute: HostsRoute,
    hostApplicationsRoute: HostApplicationsRoute,
    quizRoute: QuizRoute,
    usersRoute: UsersRoute,
    modifiersRoute: ModifiersRoute,
    meEndpoint: Me
) extends Instrumented {

  private val apiTimer    = metrics.timer("api-request-time")
  private val apiRequests = metrics.counter("api-request-count")

  def apply(): Route =
    respondWithHeader(RawHeader("Cache-Control", "no-store")) {
      handleRejections(EndpointRejectionHandler()) {
        (timed(apiTimer) & counting(apiRequests) & customDirectives.csrfGuard & customDirectives.echoCorsOrigin) {
          concat(
            (get & path("me"))(meEndpoint()),
            pathPrefix("sync")(syncRoute()),
            pathPrefix("rules")(rulesRoute()),
            pathPrefix("matches")(matchesRoute()),
            pathPrefix("hosts")(hostsRoute()),
            pathPrefix("host-applications")(hostApplicationsRoute()),
            pathPrefix("quiz")(quizRoute()),
            pathPrefix("permissions")(permissionsRoute()),
            pathPrefix("key")(keyRoute()),
            pathPrefix("docs")(docsRoute()),
            pathPrefix("users")(usersRoute()),
            pathPrefix("modifiers")(modifiersRoute())
          ) ~ complete(StatusCodes.NotFound)
        }
      }
    }
}
