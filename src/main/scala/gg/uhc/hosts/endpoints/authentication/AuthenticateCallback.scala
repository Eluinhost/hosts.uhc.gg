package gg.uhc.hosts.endpoints.authentication

import java.net.{InetAddress, URLEncoder}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import doobie.imports.ConnectionIO
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.CustomDirectives
import gg.uhc.hosts.reddit.{RedditAuthenticationApi, RedditSecuredApi}

import scala.util.{Failure, Success}

/**
  * Callback endpoint from Reddit. On valid data will generate a JWT and forward the user to
  * the frontend with the authentication JWT + any passed 'path' parameter that reddit returned
  * as part of the 'state' paramter
  */
class AuthenticateCallback(
    authenticationApi: RedditAuthenticationApi,
    oauthApi: RedditSecuredApi,
    database: Database,
    customDirectives: CustomDirectives) {
  import customDirectives._

  def error(error: String): Route =
    complete(StatusCodes.Unauthorized → s"You must provide access to use this service, Error: $error")

  def dbQuery(username: String, ip: InetAddress): ConnectionIO[List[String]] =
    for {
      _ ← database.updateAuthenticationLog(username, ip)
      perms ← database.getPermissions(username)
    } yield perms

  def valid(code: String, state: String): Route =
    requireRemoteIp { ip ⇒
      extractExecutionContext { implicit ec ⇒
        val task = for {
          accessToken ← authenticationApi.getAccessToken(authCode = code)
          username ← oauthApi.getUsername(accessToken.access_token)
          permissions ← database.run(dbQuery(username, ip))
        } yield username → permissions

        onComplete(task) {
          case Failure(t) ⇒
            extractActorSystem { ac ⇒
              ac.log.error(t, "Failure to lookup account details")
              complete(StatusCodes.Unauthorized → "Unable to lookup your account details")
            }
          case Success((username, permissions)) ⇒
            val token = URLEncoder.encode(Session.Authenticated(username, permissions).toJwt, "utf-8")
            val refresh = URLEncoder.encode(Session.RefreshToken(username).toJwt, "utf-8")
            val path = URLEncoder.encode(state, "utf-8")

            redirect(s"/login?path=$path&token=$token&refresh=$refresh", StatusCodes.TemporaryRedirect)
        }
      }
    } ~ error("Client IP address unknown")

  def apply(): Route =
    parameter('error)(error) ~                   // Check for error paramter first
      parameters(('code, 'state ? "/"))(valid) ~ // Then check for code parameter
      error("Invalid callback parameters") // Otherwise show invalid parameters message if neither matched
}
