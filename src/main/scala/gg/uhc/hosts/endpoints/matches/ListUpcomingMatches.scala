package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.endpoints.{BasicCache, DatabaseErrorRejection, EndpointRejectionHandler}

import scala.util.{Failure, Success}

class ListUpcomingMatches(cache: BasicCache) {
  import gg.uhc.hosts.CustomJsonCodec._

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      onComplete(cache.getUpcomingMatches) {
        case Success(value) ⇒ complete(value)
        case Failure(t)     ⇒ reject(DatabaseErrorRejection(t))
      }
    }
}
