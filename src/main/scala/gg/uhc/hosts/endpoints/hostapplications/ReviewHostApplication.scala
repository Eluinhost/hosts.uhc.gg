package gg.uhc.hosts.endpoints.hostapplications

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ReviewHostApplication(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class ReviewPayload(reason: Option[String])

  def apply(id: Long, status: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          entity(as[ReviewPayload]) { payload =>
            val reason = payload.reason.map(_.trim).filter(_.nonEmpty)

            validate(status != "declined" || reason.isDefined, "A reason is required to decline an application") {
              requireSucessfulQuery(database.getHostApplication(id)) {
                case None => complete(StatusCodes.NotFound)
                case Some(application) if application.status != "pending" =>
                  complete(StatusCodes.BadRequest -> "Application has already been reviewed")
                case Some(application) =>
                  val review = for {
                    granted <- if (status == "approved")
                      database.addPermission(application.username, "trial host", session.username)
                    else doobie.free.connection.delay(true)
                    updated <- database.reviewHostApplication(id, status, session.username, reason)
                  } yield granted && updated

                  requireSucessfulQuery(review) { updated =>
                    if (updated) complete(StatusCodes.OK)
                    else complete(StatusCodes.BadRequest -> "Application could not be reviewed")
                  }
              }
            }
          }
        }
      }
    }
}