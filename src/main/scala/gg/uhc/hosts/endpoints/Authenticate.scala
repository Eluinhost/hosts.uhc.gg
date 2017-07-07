package gg.uhc.hosts.endpoints

import java.util.UUID

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.redirect
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.ApiHelpers

object Authenticate {
  val route: Route =
    redirect(ApiHelpers.authentication.startAuthFlowUrl(UUID.randomUUID().toString), StatusCodes.TemporaryRedirect)
}
