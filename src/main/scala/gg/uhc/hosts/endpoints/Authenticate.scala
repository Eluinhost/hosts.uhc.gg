package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.ApiHelpers

object Authenticate {
  val route: Route = parameter('path ? "/") { path ⇒
    redirect(ApiHelpers.authentication.startAuthFlowUrl(path), StatusCodes.TemporaryRedirect)
  }
}
