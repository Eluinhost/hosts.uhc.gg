package gg.uhc.hosts.endpoints

import java.sql.SQLException
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.{complete, extractActorSystem}
import org.apache.pekko.http.scaladsl.server.{AuthenticationFailedRejection, MalformedRequestContentRejection, RejectionHandler, ValidationRejection}
import doobie.postgres.sqlstate
import io.circe.{DecodingFailure, ParsingFailure}
import cats.implicits.toShow

object EndpointRejectionHandler {
  val handler: RejectionHandler = RejectionHandler
    .newBuilder()
    .handle {
      case MissingIpErrorRejection() =>
        complete(StatusCodes.InternalServerError -> "Unable to find client IP address")
      case DatabaseErrorRejection(e: SQLException) if e.getSQLState == sqlstate.class23.UNIQUE_VIOLATION.value =>
        complete(StatusCodes.BadRequest -> "Unique field already exists")
      case DatabaseErrorRejection(t) => // when database explodes
        extractActorSystem { system =>
          system.log.error("DB error", t)
          t.printStackTrace()
          complete(StatusCodes.InternalServerError)
        }
      case AuthenticationFailedRejection(AuthenticationFailedRejection.CredentialsRejected, _) => // when no perms
        complete(StatusCodes.Forbidden)
      case AuthenticationFailedRejection(AuthenticationFailedRejection.CredentialsMissing, _) => // when no session
        complete(StatusCodes.Unauthorized)
      case ValidationRejection(m, _) => // when invalid data
        complete(StatusCodes.BadRequest -> m)
      case MalformedRequestContentRejection(_, t: DecodingFailure) =>
        extractActorSystem { system =>
          system.log.error(t, "Malformed request")
          complete(StatusCodes.BadRequest -> s"Malformed request: ${t.show}")
        }
      case MalformedRequestContentRejection(_, t: ParsingFailure) =>
        extractActorSystem { system =>
          system.log.error(t, "Parsing failure")
          complete(StatusCodes.BadRequest -> s"Parsing Failure: ${t.show}")
        }
      case t =>
        extractActorSystem { system =>
          system.log.error(s"Unknown rejection type $t")
          complete(StatusCodes.InternalServerError)
        }
    }
    .result()

  def apply(): RejectionHandler = handler
}
