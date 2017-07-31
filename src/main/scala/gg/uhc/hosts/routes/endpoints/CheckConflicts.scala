package gg.uhc.hosts.routes.endpoints

import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class CheckConflicts(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def route(region: String, date: Instant): Route =
    handleRejections(EndpointRejectionHandler()) {
      val start = date.minus(15, ChronoUnit.MINUTES)
      val end = date.plus(15, ChronoUnit.MINUTES)

      requireSucessfulQuery(database.getMatchesInDateRangeAndRegion(start, end, region.toUpperCase)) { conflicts ⇒
        complete(conflicts)
      }
    }
}
