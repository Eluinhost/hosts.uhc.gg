package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

/**
  * Endpoint that when called with a valid authentication header
  * will return a new JWT with refreshed permissions from the DB.
  */
class AuthenticateRefresh(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class AuthenticateRefreshResponse(accessToken: String, refreshToken: String)

  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireRefreshAuthentication { refresh ⇒
        requireSucessfulQuery(database.getPermissions(refresh.username)) { perms ⇒
          complete(
            AuthenticateRefreshResponse(
              accessToken = Session.Authenticated(username = refresh.username, permissions = perms).toJwt,
              refreshToken = Session.RefreshToken(username = refresh.username).toJwt
            )
          )
        }
      }
    }
}
