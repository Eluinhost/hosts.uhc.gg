package gg.uhc.hosts.endpoints.docs

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route

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
