package gg.uhc.hosts.endpoints.authentication

import java.net.InetAddress

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import doobie.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

/**
 * Endpoint that when called with a valid `refresh` token will return a new access token + refresh token pair, with the
 * permissions looked up freshly from the DB.
 *
 * Requires a refresh token, an access token is rejected. A refresh token has no permissions, the permissions of the new
 * token are fresh from the database.
 */
class AuthenticateRefresh(directives: CustomDirectives, database: Database) {

  import CustomJsonCodec.*
  import directives.*

  case class AuthenticateRefreshResponse(accessToken: String, refreshToken: String)

  def dbQuery(username: String, ip: InetAddress): ConnectionIO[List[String]] =
    for {
      _     <- database.updateAuthenticationLog(username, ip)
      perms <- database.getPermissions(username)
    } yield perms

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireRefreshAuthentication { refresh =>
        requireRemoteIp { ip =>
          requireSucessfulQuery(dbQuery(refresh.username, ip)) { perms =>
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
