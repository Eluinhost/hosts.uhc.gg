package gg.uhc.hosts.endpoints.alerts

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, handleRejections}
import akka.http.scaladsl.server.{Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetAllAlertRules(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          requireSucessfulQuery(database.getAllAlertRules()) { rules =>
            complete(StatusCodes.OK -> rules)
          }
        }
      }
    }
}
