package gg.uhc.hosts.endpoints.authentication

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.reddit.RedditAuthenticationApi

/**
  * Starts authentication process by forwarding the user to Reddit.
  * Can provide a path parameter that will be passed on to the
  * frontend when the callback happens
  */
class Authenticate(api: RedditAuthenticationApi) {
  def apply(path: String): Route = redirect(api.startAuthFlowUrl(path), StatusCodes.TemporaryRedirect)
}
