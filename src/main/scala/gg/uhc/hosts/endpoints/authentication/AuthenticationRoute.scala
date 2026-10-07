package gg.uhc.hosts.endpoints.authentication

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route

class AuthenticationRoute(
    authenticate: Authenticate,
    authenticateCallback: AuthenticateCallback,
    authenticateLogout: AuthenticateLogout
) {

  def apply(): Route =
    concat(
      (pathEndOrSingleSlash & parameter("state")) { state =>
        authenticate(state)
      },
      path("callback")(authenticateCallback()),
      (post & path("logout"))(authenticateLogout()),
      complete(StatusCodes.NotFound)
    )
}
