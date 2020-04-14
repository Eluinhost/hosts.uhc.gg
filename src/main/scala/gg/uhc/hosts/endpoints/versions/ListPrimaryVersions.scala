package gg.uhc.hosts.endpoints.versions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.CustomJsonCodec._

class ListPrimaryVersions() {
  def apply(): Route = complete(Version.options)
}
