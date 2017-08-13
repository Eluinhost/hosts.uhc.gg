package gg.uhc.hosts.endpoints.authentication

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class AuthenticationRoute(
    authenticate: Authenticate,
    authenticateCallback: AuthenticateCallback,
    authenticateRefresh: AuthenticateRefresh) {

  def apply(): Route =
    concat(
      (pathEndOrSingleSlash & parameter('path ? "/")) { path ⇒
        authenticate(path)
      },
      path("callback")(authenticateCallback()),
      (post & path("refresh"))(authenticateRefresh()),
      complete(StatusCodes.NotFound)
    )
}
