package gg.uhc.hosts.routes

import akka.http.scaladsl.model.headers.`Access-Control-Allow-Origin`
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akkahttptwirl.TwirlSupport._
import gg.uhc.hosts.routes.endpoints._

class Routes(
    listMatches: ListMatches,
    createMatches: CreateMatch,
    removeMatches: RemoveMatch,
    showMatch: ShowMatch,
    auth: Authenticate,
    authCallback: AuthenticateCallback,
    authRefresh: AuthenticateRefresh,
    timeSync: TimeSync) {

  val api: Route = pathPrefix("api") {
    respondWithHeader(`Access-Control-Allow-Origin`.*) {
      pathPrefix("matches") {
        pathEndOrSingleSlash {
          get(listMatches.route) ~ post(createMatches.route)
        } ~ path(IntNumber) { id ⇒
          get(showMatch.route(id)) ~ delete(removeMatches.route(id))
        }
      } ~
        pathPrefix("sync")(timeSync.route) ~
        complete(StatusCodes.NotFound)
    }
  }

  val frontend: Route =
    path("favicon.png") {
      getFromResource("favicon.png")
    } ~ complete(html.frontend.render())

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
