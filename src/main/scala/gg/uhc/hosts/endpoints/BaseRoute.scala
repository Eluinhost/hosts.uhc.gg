package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.endpoints.assets.AssetsRoute
import gg.uhc.hosts.endpoints.authentication.AuthenticationRoute
import gg.uhc.hosts.endpoints.frontend.FrontendRoute

class BaseRoute(
    apiRoute: ApiRoute,
    authenticationRoute: AuthenticationRoute,
    assetsRoute: AssetsRoute,
    frontendRoute: FrontendRoute) {

  def apply(): Route =
    (logRequest("server") & logResult("server")) {
      concat(
        pathPrefix("api")(apiRoute()),
        pathPrefix("authenticate")(authenticationRoute()),
        pathPrefix("assets")(assetsRoute()),
        frontendRoute(),
        complete(StatusCodes.NotFound) // shouldn't really be hit as frontend should catch anything that falls to it
      )
    }
}
