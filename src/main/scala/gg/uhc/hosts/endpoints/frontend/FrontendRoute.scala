package gg.uhc.hosts.endpoints.frontend

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class FrontendRoute {

  def apply(): Route =
    concat(
      path("favicon.png") {
        getFromResource("favicon.png")
      },
      getFromResource("frontend.html")
    )

}
