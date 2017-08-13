package gg.uhc.hosts.endpoints.docs

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class DocsRoute {
  def apply(): Route =
    concat(
      pathEndOrSingleSlash {
        getFromFile("apidocs/index.html")
      },
      getFromDirectory("apidocs")
    )

}
