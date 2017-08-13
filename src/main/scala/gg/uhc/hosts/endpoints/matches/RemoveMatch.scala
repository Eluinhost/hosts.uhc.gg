package gg.uhc.hosts.endpoints.matches

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.HttpChallenges
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import gg.uhc.hosts._
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

/**
  * Removes a match. Must provide a reason. Can only be ran by 'moderator' permission or author of match.
  */
class RemoveMatch(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  case class RemoveMatchPayload(reason: String)

  def validate(data: RemoveMatchPayload): Directive[Unit] = {
    if (data.reason.length < 3)
      return reject(ValidationRejection("Reason must be at least 3 characters"))

    if (data.reason.length > 256)
      return reject(ValidationRejection("Reason must be at most 255 characters"))

    pass
  }

  def requireOwner(id: Long, username: String): Directive0 =
    requireSucessfulQuery(database.isOwnerOfMatch(id, username)) flatMap {
      case true ⇒
        pass
      case false ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsRejected,
            HttpChallenges.basic("login")
          )
        )
    }

  def apply(id: Int): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { authentication ⇒
        (requirePermission("moderator", authentication.username) | requireOwner(id, authentication.username)) {
          entity(as[RemoveMatchPayload]) { data ⇒
            validate(data) {
              requireSucessfulQuery(database.removeMatch(id, data.reason, authentication.username)) {
                case 0 ⇒ complete(StatusCodes.NotFound) // None updated
                case _ ⇒ complete(StatusCodes.NoContent)
              }
            }
          }
        }
      }
    }
}
