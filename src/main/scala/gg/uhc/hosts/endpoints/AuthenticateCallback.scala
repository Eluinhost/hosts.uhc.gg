package gg.uhc.hosts.endpoints

import java.net.URLEncoder

import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import gg.uhc.hosts.{ApiHelpers, Database, Session}

import scala.util.{Failure, Success}

/**
  * Callback endpoint from Reddit. On valid data will generate a JWT and forward the user to
  * the frontend with the authentication JWT + any passed 'path' parameter that reddit returned
  * as part of the 'state' paramter
  */
object AuthenticateCallback {
  def error(error: String): Route =
    complete(StatusCodes.Unauthorized → s"You must provide access to use this service, Error: $error")

  def valid(code: String, state: String): Route =
    extractExecutionContext { implicit ec ⇒
      val task = for {
        accessToken ← ApiHelpers.authentication.getAccessToken(authCode = code)
        username    ← ApiHelpers.api.getUsername(accessToken.access_token)
        permissions ← Database.runDbQuery(Database.getPermissions(username))
      } yield
        Session(
          username = username,
          permissions = permissions
        )

      onComplete(task) {
        case Failure(_) ⇒
          complete(StatusCodes.Unauthorized → "Unable to lookup your account details")
        case Success(session) ⇒
          redirect(
            s"/login?path=${URLEncoder.encode(state, "utf-8")}&token=${URLEncoder.encode(session.toJwt, "utf-8")}",
            StatusCodes.TemporaryRedirect
          )
      }
    }

  val route: Route =
    parameter('error)(error) ~                 // Check for error paramter first
      parameters('code, 'state ? "/")(valid) ~ // Then check for code parameter
      error("Invalid callback parameters") // Otherwise show invalid parameters message if neither matched
}
