package gg.uhc.hosts.routes

import java.time.Instant

import akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{PathMatcher1, Route}
import gg.uhc.hosts.routes.endpoints._

import scala.util.Try

class Routes(
    listMatches: ListMatches,
    createMatches: CreateMatch,
    removeMatches: RemoveMatch,
    showMatch: ShowMatch,
    auth: Authenticate,
    authCallback: AuthenticateCallback,
    authRefresh: AuthenticateRefresh,
    addPermission: AddPermission,
    removePermission: RemovePermission,
    permissionModerationLog: PermissionModerationLog,
    listPermissions: ListPermissions,
    timeSync: TimeSync,
    checkConflicts: CheckConflicts,
    getApiKey: GetApiKey,
    regenerateApiKey: RegenerateApiKey,
    getLatestRules: GetLatestRules,
    setRules: SetRules,
    approveMatch: ApproveMatch) {

  implicit class JsonParsedSegment(segment: PathMatcher1[String]) {
    def asInstant: PathMatcher1[Instant] =
      segment.flatMap { string ⇒
        Try {
          System.out.println(string)
          System.out.println(Instant.parse(string))
          Instant.parse(string)
        }.toOption
      }
  }

  val matches: Route = pathEndOrSingleSlash {
    get(listMatches.route) ~ post(createMatches.route)
  } ~ pathPrefix(IntNumber) { id ⇒
    concat(
      (post & path("approve"))(approveMatch.route(id)),
      (get & pathEndOrSingleSlash)(showMatch.route(id)),
      (delete & pathEndOrSingleSlash)(removeMatches.route(id))
    )
  } ~ (get & pathPrefix("conflicts") & path(Segment / Segment.asInstant) & pathEndOrSingleSlash)(
    checkConflicts.route
  )

  val permissions: Route = get {
    pathEndOrSingleSlash(listPermissions.route) ~
      (path("log") & pathEndOrSingleSlash)(permissionModerationLog.route)
  } ~ path(Segments(2)) { segments ⇒
    post(addPermission.route(segments.head, segments.last)) ~
      delete(removePermission.route(segments.head, segments.last))
  }

  val key: Route = pathEndOrSingleSlash {
    get(getApiKey.route) ~ post(regenerateApiKey.route)
  }

  val rules: Route = pathEndOrSingleSlash {
    get(getLatestRules.route) ~ post(setRules.route)
  }

  val sync: Route = (get & pathEndOrSingleSlash)(timeSync.route)

  val docs: Route = getFromDirectory("apidocs")

  val api: Route = pathPrefix("api") {
    respondWithHeader(`Access-Control-Allow-Origin`.*) {
      concat(
        pathPrefix("sync")(sync),
        pathPrefix("rules")(rules),
        pathPrefix("matches")(matches),
        pathPrefix("permissions")(permissions),
        pathPrefix("key")(key),
        pathPrefix("docs")(docs)
      ) ~ complete(StatusCodes.NotFound)
    }
  }

  val frontend: Route =
    path("favicon.png") {
      getFromResource("favicon.png")
    } ~ getFromResource("frontend.html")

  val authenticate: Route = pathPrefix("authenticate") {
    pathEndOrSingleSlash(auth.route) ~
      (pathPrefix("callback") & pathEndOrSingleSlash)(authCallback.route) ~
      (post & pathPrefix("refresh") & pathEndOrSingleSlash)(authRefresh.route) ~
      complete(StatusCodes.NotFound)
  }

  val assets: Route = pathPrefix("assets") {
    getFromDirectory("assets") ~ complete(StatusCodes.NotFound)
  }

  val all: Route = (logRequest("server") & logResult("server")) {
    api ~
      authenticate ~
      assets ~
      frontend ~
      complete(StatusCodes.NotFound) // shouldn't really be hit as frontend should catch anything that falls to it
  }
}
