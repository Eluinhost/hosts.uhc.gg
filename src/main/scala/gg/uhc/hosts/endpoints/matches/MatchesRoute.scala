package gg.uhc.hosts.endpoints.matches

import java.time.Instant

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{PathMatcher1, Route}

import scala.util.Try

class MatchesRoute(
    approveMatch: ApproveMatch,
    checkConflicts: CheckConflicts,
    createMatch: CreateMatch,
    listMatches: ListUpcomingMatches,
    removeMatch: RemoveMatch,
    showMatch: ShowMatch) {

  implicit class JsonParsedSegment(segment: PathMatcher1[String]) {
    def asInstant: PathMatcher1[Instant] =
      segment.flatMap { string =>
        Try {
          System.out.println(string)
          System.out.println(Instant.parse(string))
          Instant.parse(string)
        }.toOption
      }
  }

  def apply(): Route =
    concat(
      (pathEndOrSingleSlash & post)(createMatch()),
      (get & pathPrefix("upcoming"))(listMatches()),
      pathPrefix(IntNumber) { id =>
        concat(
          (post & path("approve"))(approveMatch(id)),
          (get & pathEndOrSingleSlash)(showMatch(id)),
          (delete & pathEndOrSingleSlash)(removeMatch(id))
        )
      },
      (get & pathPrefix("conflicts")) (checkConflicts())
    )
}
