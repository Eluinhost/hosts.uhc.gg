package gg.uhc.hosts.endpoints.matches

import scala.util.{Failure, Success}

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import org.apache.pekko.http.scaladsl.server.directives.RouteDirectives.{complete, reject}
import gg.uhc.hosts.CustomJsonCodec.*
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.endpoints.{BasicCache, DatabaseErrorRejection, EndpointRejectionHandler}
import gg.uhc.hosts.endpoints.matches.websocket.MatchesWebsocket

class ListUpcomingMatches(cache: BasicCache, websocket: MatchesWebsocket) extends Instrumented {
  private val upcomingMatchesTimer   = metrics.timer("upcoming-matches-request-time")
  private val upcomingMatchesCounter = metrics.counter("upcoming-matches-request-count")

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      concat(
        pathEndOrSingleSlash {
          (timed(upcomingMatchesTimer) & counting(upcomingMatchesCounter)) {
            onComplete(cache.getUpcomingMatches) {
              case Success(value) => complete(value)
              case Failure(t)     => reject(DatabaseErrorRejection(t))
            }
          }
        },
        path("listen")(websocket.route)
      )
    }
}
