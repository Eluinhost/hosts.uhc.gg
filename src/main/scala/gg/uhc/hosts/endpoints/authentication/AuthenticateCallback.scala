package gg.uhc.hosts.endpoints.authentication

import scala.util.{Failure, Success}

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.authentication.{SessionCookie, SessionStore}
import gg.uhc.hosts.endpoints.CustomDirectives
import gg.uhc.hosts.reddit.{RedditAuthenticationApi, RedditSecuredApi}

/**
 * Callback from Reddit. On a valid code a session is created and its id is delivered as a
 * `Secure; HttpOnly; SameSite=Lax` cookie scoped to the whole site.
 */
class AuthenticateCallback(
    authenticationApi: RedditAuthenticationApi,
    oauthApi: RedditSecuredApi,
    sessions: SessionStore,
    customDirectives: CustomDirectives
) {

  import customDirectives.*

  def error(error: String): Route =
    complete(StatusCodes.Unauthorized -> s"You must provide access to use this service, Error: $error")

  private def valid(code: String, state: String, userAgent: Option[String]): Route =
    requireRemoteIp { ip =>
      extractExecutionContext { implicit ec =>
        val task = for {
          accessToken <- authenticationApi.getAccessToken(authCode = code)
          username    <- oauthApi.getUsername(accessToken.access_token)
          _           <- sessions.logAccess(username, Some(ip))
        } yield username

        onComplete(task) {
          case Failure(t)        =>
            extractActorSystem { ac =>
              ac.log.error(t, "Failure to lookup account details")
              complete(StatusCodes.Unauthorized -> "Unable to lookup your account details")
            }
          case Success(username) =>
            requireSucessfulFuture(sessions.create(username, Some(ip), userAgent)) { created =>
              setCookie(SessionCookie.from(created.id, created.expiresAt)) {
                redirect(s"/login?state=$state", StatusCodes.TemporaryRedirect)
              }
            }
        }
      }
    } ~ error("Client IP address unknown")

  def apply(): Route =
    parameter("error")(error) ~            // Check for error paramter first
      (parameters("code", "state") & optionalHeaderValueByName("User-Agent")) { (code, state, userAgent) =>
        valid(code, state, userAgent) // Then check for code parameter
      } ~
      error("Invalid callback parameters") // Otherwise show invalid parameters message if neither matched
}
