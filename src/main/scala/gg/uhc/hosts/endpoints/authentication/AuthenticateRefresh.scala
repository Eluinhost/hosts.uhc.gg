package gg.uhc.hosts.endpoints.authentication

import java.net.InetAddress

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports.ConnectionIO
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

/**
  * Endpoint that when called with a valid authentication header
  * will return a new JWT with refreshed permissions from the DB.
  */
class AuthenticateRefresh(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  case class AuthenticateRefreshResponse(accessToken: String, refreshToken: String)

  def dbQuery(username: String, ip: InetAddress): ConnectionIO[List[String]] =
    for {
      _ ← database.updateAuthenticationLog(username, ip)
      perms ← database.getPermissions(username)
    } yield perms

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireRefreshAuthentication { refresh ⇒
        requireRemoteIp { ip ⇒
          requireSucessfulQuery(dbQuery(refresh.username, ip)) { perms ⇒
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
}
