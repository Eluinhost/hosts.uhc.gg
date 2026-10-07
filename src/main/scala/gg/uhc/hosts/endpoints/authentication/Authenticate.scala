package gg.uhc.hosts.endpoints.authentication

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.reddit.RedditAuthenticationApi

/**
 * Starts authentication process by forwarding the user to Reddit. The state parameter is an opaque CSRF token generated
 * by the frontend; Reddit round-trips it untouched and the callback returns it to the frontend, which validates it
 * against the copy kept in sessionStorage
 */
class Authenticate(api: RedditAuthenticationApi) {
  def apply(state: String): Route = redirect(api.startAuthFlowUrl(state), StatusCodes.TemporaryRedirect)
}
