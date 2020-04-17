package gg.uhc.hosts.endpoints.docs

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class DocsRoute {
  def apply(): Route =
      concat(
        pathEndOrSingleSlash {
          redirectToTrailingSlashIfMissing(StatusCodes.Found) {
            getFromFile("apidocs/index.html")
          }
        },
        getFromDirectory("apidocs")
      )
}
