package gg.uhc.hosts.endpoints.versions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class VersionsRoute(listPrimaryVersions: ListPrimaryVersions) {

  def apply(): Route =
    pathPrefix("primary") {
      (get & pathEndOrSingleSlash)(listPrimaryVersions())
    }
}

