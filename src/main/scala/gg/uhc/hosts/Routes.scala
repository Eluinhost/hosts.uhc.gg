package gg.uhc.hosts

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akkahttptwirl.TwirlSupport._
import gg.uhc.hosts.endpoints.{Authenticate, AuthenticateCallback, CreateMatch, ListMatches}


object Routes {
  val api: Route = pathPrefix("api") {
    (pathPrefix("matches") & pathEndOrSingleSlash) {
      get(ListMatches.route) ~ post(CreateMatch.route)
    } ~ complete(StatusCodes.NotFound)
  }

  val frontend: Route =
    complete(html.frontend.render())

  val authenticate: Route = pathPrefix("authenticate") {
    pathEndOrSingleSlash(Authenticate.route) ~
      (pathPrefix("callback") & pathEndOrSingleSlash)(AuthenticateCallback.route) ~
      complete(StatusCodes.NotFound)
  }

  val assets: Route = pathPrefix("assets") {
    getFromDirectory("frontend/build")
  }

  val all: Route = (logRequest("server") & logResult("server")) {
    api ~
      authenticate ~
      assets ~
      frontend ~
      complete(StatusCodes.NotFound) // shouldn't really be hit as frontend should catch anything that falls to it
  }
}
