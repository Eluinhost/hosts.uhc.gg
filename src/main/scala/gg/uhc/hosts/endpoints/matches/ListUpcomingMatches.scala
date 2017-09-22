package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.endpoints.{BasicCache, DatabaseErrorRejection, EndpointRejectionHandler}

import scala.util.{Failure, Success}

class ListUpcomingMatches(cache: BasicCache) extends Instrumented {
  import gg.uhc.hosts.CustomJsonCodec._

  private[this] val upcomingMatchesTimer = metrics.timer("upcoming-matches-request-time")
  private[this] val upcomingMatchesCounter = metrics.counter("upcoming-matches-request-count")

  def apply(): Route =
    (timed(upcomingMatchesTimer) & counting(upcomingMatchesCounter)) {
      handleRejections(EndpointRejectionHandler()) {
        onComplete(cache.getUpcomingMatches) {
          case Success(value) ⇒ complete(value)
          case Failure(t)     ⇒ reject(DatabaseErrorRejection(t))
        }
      }
    }
}
