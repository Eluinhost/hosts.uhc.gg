package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, extractActorSystem}
import akka.http.scaladsl.server.{AuthenticationFailedRejection, RejectionHandler, ValidationRejection}
import gg.uhc.hosts.routes.DatabaseErrorRejection

object EndpointRejectionHandler {
  val handler: RejectionHandler = RejectionHandler
    .newBuilder()
    .handle {
      case DatabaseErrorRejection(t) ⇒ // when database explodes
        extractActorSystem { system ⇒
          system.log.error("DB error", t)
          complete(StatusCodes.InternalServerError)
        }
      case AuthenticationFailedRejection(AuthenticationFailedRejection.CredentialsRejected, _) ⇒ // when no perms
        complete(StatusCodes.Forbidden)
      case AuthenticationFailedRejection(AuthenticationFailedRejection.CredentialsMissing, _) ⇒ // when no session
        complete(StatusCodes.Unauthorized)
      case ValidationRejection(m, _) ⇒ // when invalid data
        complete(StatusCodes.BadRequest → m)
      case t ⇒
        extractActorSystem { system ⇒
          system.log.error(s"Unknown rejection type $t")
          complete(StatusCodes.InternalServerError)
        }
    }
    .result()

  def apply(): RejectionHandler = handler
}
