package gg.uhc.hosts.endpoints.modifiers

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class ModifiersRoute(listModifiers: ListModifiers) {
  def apply(): Route =
    (pathEndOrSingleSlash & get)(listModifiers())
  }
