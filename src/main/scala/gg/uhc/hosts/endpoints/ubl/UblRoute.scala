package gg.uhc.hosts.endpoints.ubl

import java.util.UUID

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{PathMatcher1, Route}

import scala.util.Try

class UblRoute(
    getCurrentUbl: GetCurrentUbl,
    createUblEntry: CreateUblEntry,
    getByUuid: GetUblForUuid,
    usernameSearch: UsernameSearch,
    editUblEntry: EditUblEntry,
    deleteUblEntry: DeleteUblEntry) {

  implicit class SegmentExtensions(segment: PathMatcher1[String]) {
    def asUuid: PathMatcher1[UUID] =
      segment.flatMap { string =>
        Try {
          UUID.fromString(string)
        }.toOption
      }
  }

  def apply(): Route =
    concat(
      (get & path("current"))(getCurrentUbl()),
      (delete & path(IntNumber))(deleteUblEntry(_)),
      (post & path(IntNumber))(editUblEntry(_)),
      (post & pathEndOrSingleSlash)(createUblEntry()),
      (post & path("search" / Segment))(usernameSearch(_)),
      (get & path(Segment.asUuid))(getByUuid(_))
    )
}
