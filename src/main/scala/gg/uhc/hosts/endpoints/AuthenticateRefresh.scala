package gg.uhc.hosts.endpoints

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.Database.requireSucessfulQuery
import gg.uhc.hosts.Session.requireValidSession
import gg.uhc.hosts.{Database, Session}

/**
  * Endpoint that when called with a valid authentication header
  * will return a new JWT with refreshed permissions from the DB.
  */
object AuthenticateRefresh {
  val route: Route =
    handleRejections(EndpointRejectionHandler()) {
      requireValidSession { session ⇒
        requireSucessfulQuery(Database.getPermissions(session.username)) { perms ⇒
          complete(Session(username = session.username, permissions = perms).toJwt)
        }
      }
    }
}
