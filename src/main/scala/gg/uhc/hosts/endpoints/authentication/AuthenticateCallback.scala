package gg.uhc.hosts.endpoints.authentication

import java.net.InetAddress

import scala.util.{Failure, Success}

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.model.headers.HttpCookie
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import doobie.*
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.CustomDirectives
import gg.uhc.hosts.reddit.{RedditAuthenticationApi, RedditSecuredApi}

/**
 * Callback endpoint from Reddit. On valid data will generate a JWT and forward the user to the frontend with the
 * authentication JWTs delivered via a short-lived handoff cookie (kept out of the URL to avoid leaking into access logs
 * and browser history) + the 'state' CSRF token that reddit round-tripped from the frontend
 */
class AuthenticateCallback(
    authenticationApi: RedditAuthenticationApi,
    oauthApi: RedditSecuredApi,
    database: Database,
    customDirectives: CustomDirectives
) {

  import customDirectives.*

  def error(error: String): Route =
    complete(StatusCodes.Unauthorized -> s"You must provide access to use this service, Error: $error")

  def dbQuery(username: String, ip: InetAddress): ConnectionIO[List[String]] =
    for {
      _     <- database.updateAuthenticationLog(username, ip)
      perms <- database.getPermissions(username)
    } yield perms

  def valid(code: String, state: String): Route =
    requireRemoteIp { ip =>
      extractExecutionContext { implicit ec =>
        val task = for {
          accessToken <- authenticationApi.getAccessToken(authCode = code)
          username    <- oauthApi.getUsername(accessToken.access_token)
          permissions <- database.run(dbQuery(username, ip))
        } yield username -> permissions

        onComplete(task) {
          case Failure(t)                       =>
            extractActorSystem { ac =>
              ac.log.error(t, "Failure to lookup account details")
              complete(StatusCodes.Unauthorized -> "Unable to lookup your account details")
            }
          case Success((username, permissions)) =>
            // base64url JWTs with '~' separater
            val handoff =
              s"${Session.Authenticated(username, permissions).toJwt}~${Session.RefreshToken(username).toJwt}"

            setCookie(HttpCookie(
              "uhcgg_handoff",
              handoff,
              maxAge = Some(60),
              path = Some("/login"),
            )) {
              redirect(s"/login?state=$state", StatusCodes.TemporaryRedirect)
            }
        }
      }
    } ~ error("Client IP address unknown")

  def apply(): Route =
    parameter("error")(error) ~            // Check for error paramter first
      parameters("code", "state")(valid) ~ // Then check for code parameter
      error("Invalid callback parameters") // Otherwise show invalid parameters message if neither matched
}
