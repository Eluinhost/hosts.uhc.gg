package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

/**
  * Endpoint that when called with a valid authentication header
  * will return a new JWT with refreshed permissions from the DB.
  */
class AuthenticateRefresh(directives: CustomDirectives, database: Database) {
  import directives._

  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session ⇒
        requireSucessfulQuery(database.getPermissions(session.username)) { perms ⇒
          complete(Session.Authenticated(username = session.username, permissions = perms).toJwt)
        }
      }
    }
}
