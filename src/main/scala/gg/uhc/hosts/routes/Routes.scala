package gg.uhc.hosts.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akkahttptwirl.TwirlSupport._
import gg.uhc.hosts.routes.endpoints._

class Routes(
    listMatches: ListMatches,
    createMatches: CreateMatch,
    removeMatches: RemoveMatch,
    auth: Authenticate,
    authCallback: AuthenticateCallback,
    authRefresh: AuthenticateRefresh) {

  val api: Route = pathPrefix("api") {
    pathPrefix("matches") {
      pathEndOrSingleSlash {
        get(listMatches.route) ~ post(createMatches.route)
      } ~ delete(removeMatches.route)
    } ~ complete(StatusCodes.NotFound)
  }

  val frontend: Route =
    complete(html.frontend.render())

  val authenticate: Route = pathPrefix("authenticate") {
    pathEndOrSingleSlash(auth.route) ~
      (pathPrefix("callback") & pathEndOrSingleSlash)(authCallback.route) ~
      (post & pathPrefix("refresh") & pathEndOrSingleSlash)(authRefresh.route) ~
      complete(StatusCodes.NotFound)
  }

  val assets: Route = pathPrefix("assets") {
    getFromDirectory("assets")
  }

  val all: Route = (logRequest("server") & logResult("server")) {
    api ~
      authenticate ~
      assets ~
      frontend ~
      complete(StatusCodes.NotFound) // shouldn't really be hit as frontend should catch anything that falls to it
  }
}
