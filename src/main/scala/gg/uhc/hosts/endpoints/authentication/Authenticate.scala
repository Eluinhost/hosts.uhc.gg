package gg.uhc.hosts.endpoints.authentication

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.reddit.WwwRedditApi

/**
  * Starts authentication process by forwarding the user to Reddit.
  * Can provide a path parameter that will be passed on to the
  * frontend when the callback happens
  */
class Authenticate(api: WwwRedditApi) {
  def apply(path: String): Route = redirect(api.startAuthFlowUrl(path), StatusCodes.TemporaryRedirect)
}
