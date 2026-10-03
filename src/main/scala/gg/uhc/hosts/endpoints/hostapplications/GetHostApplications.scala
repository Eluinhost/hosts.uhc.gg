package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetHostApplications(database: Database, customDirectives: CustomDirectives) {

  import CustomJsonCodec.*
  import customDirectives.*

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getRecentHostApplications) { applications =>
        complete(applications)
      }
    }
}
