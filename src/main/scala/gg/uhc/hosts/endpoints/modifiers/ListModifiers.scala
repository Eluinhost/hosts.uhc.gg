package gg.uhc.hosts.endpoints.modifiers

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.database.MatchModifiers
import gg.uhc.hosts.endpoints.EndpointRejectionHandler

class ListModifiers {
  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      complete(MatchModifiers.allowed)
    }
}
