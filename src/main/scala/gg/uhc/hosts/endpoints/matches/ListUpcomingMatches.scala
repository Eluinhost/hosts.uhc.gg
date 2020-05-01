package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.RouteDirectives.{complete, reject}
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.endpoints.matches.websocket.MatchesWebsocket
import gg.uhc.hosts.endpoints.{BasicCache, DatabaseErrorRejection, EndpointRejectionHandler}

import scala.util.{Failure, Success}

class ListUpcomingMatches(cache: BasicCache, websocket: MatchesWebsocket) extends Instrumented {
  private[this] val upcomingMatchesTimer   = metrics.timer("upcoming-matches-request-time")
  private[this] val upcomingMatchesCounter = metrics.counter("upcoming-matches-request-count")

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      concat(
        pathEndOrSingleSlash {
          (timed(upcomingMatchesTimer) & counting(upcomingMatchesCounter)) {
            onComplete(cache.getUpcomingMatches) {
              case Success(value) => complete(value)
              case Failure(t) => reject(DatabaseErrorRejection(t))
            }
          }
        },
        path("listen")(websocket.route)
      )
    }
}
