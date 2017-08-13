package gg.uhc.hosts.endpoints.assets

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class AssetsRoute {
  def apply(): Route =
    concat(
      getFromDirectory("assets"),
      complete(StatusCodes.NotFound)
    )
}
