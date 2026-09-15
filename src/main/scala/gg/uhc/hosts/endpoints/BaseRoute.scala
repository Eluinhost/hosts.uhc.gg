package gg.uhc.hosts.endpoints

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.endpoints.authentication.AuthenticationRoute

class BaseRoute(
    apiRoute: ApiRoute,
    authenticationRoute: AuthenticationRoute) {

  def apply(): Route =
    (logRequest("server") & logResult("server")) {
      concat(
        pathPrefix("api")(apiRoute()),
        pathPrefix("authenticate")(authenticationRoute()),
        complete(StatusCodes.NotFound)
      )
    }
}
