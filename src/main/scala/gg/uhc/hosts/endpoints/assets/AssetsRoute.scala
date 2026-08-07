package gg.uhc.hosts.endpoints.assets

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route

class AssetsRoute {
  def apply(): Route =
    concat(
      getFromDirectory("assets"),
      complete(StatusCodes.NotFound)
    )
}
