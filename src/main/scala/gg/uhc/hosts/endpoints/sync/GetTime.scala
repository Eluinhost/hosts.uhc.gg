package gg.uhc.hosts.endpoints.sync

import java.time.Instant

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec

class GetTime {
  import CustomJsonCodec._

  def apply(): Route = complete(Instant.now())
}
