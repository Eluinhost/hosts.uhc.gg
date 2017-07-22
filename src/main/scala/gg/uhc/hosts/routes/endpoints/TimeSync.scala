package gg.uhc.hosts.routes.endpoints

import java.time.Instant

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec

class TimeSync {
  import CustomJsonCodec._

  val route: Route = complete(Instant.now())
}
