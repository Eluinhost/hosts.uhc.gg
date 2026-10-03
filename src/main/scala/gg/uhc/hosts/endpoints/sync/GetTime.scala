package gg.uhc.hosts.endpoints.sync

import java.time.Instant

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec

class GetTime {

  import CustomJsonCodec.*

  def apply(): Route = complete(Instant.now())
}
