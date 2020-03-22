package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, extractActorSystem}
import akka.http.scaladsl.server.{AuthenticationFailedRejection, MalformedRequestContentRejection, RejectionHandler, ValidationRejection}
import cats.Show
import io.circe.CursorOp._
import io.circe.{CursorOp, DecodingFailure, ParsingFailure}

object EndpointRejectionHandler {
  private[this] sealed trait Selection
  private[this] case class SelectField(field: String) extends Selection
  private[this] case class SelectIndex(index: Int)    extends Selection
  private[this] case class Op(op: CursorOp)           extends Selection

  private[this] def decodingFailure2String(d: DecodingFailure): String = {
    val selections = d.history.foldRight(List[Selection]()) { (historyOp, sels) =>
      (historyOp, sels) match {
        case (DownField(k), _)                   => SelectField(k) :: sels
        case (DownArray, _)                      => SelectIndex(0) :: sels
        case (MoveUp, _ :: rest)                 => rest
        case (MoveRight, SelectIndex(i) :: tail) => SelectIndex(i + 1) :: tail
        case (MoveLeft, SelectIndex(i) :: tail)  => SelectIndex(i - 1) :: tail
        case (RightN(n), SelectIndex(i) :: tail) => SelectIndex(i + n) :: tail
        case (LeftN(n), SelectIndex(i) :: tail)  => SelectIndex(i - n) :: tail
        case (op, _)                             => Op(op) :: sels
      }
    }

    val selectionsStr = selections.foldLeft("") {
      case (str, SelectField(f)) => s".$f$str"
      case (str, SelectIndex(i)) => s"[$i]$str"
      case (str, Op(op))         => s"{${Show[CursorOp].show(op)}}$str"
    }

    s"DecodingFailure at $selectionsStr: ${d.message}"
  }

  val handler: RejectionHandler = RejectionHandler
    .newBuilder()
    .handle {
      case MissingIpErrorRejection() =>
        complete(StatusCodes.InternalServerError -> "Unable to find client IP address")
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
          complete(StatusCodes.BadRequest -> s"Invalid request data: ${decodingFailure2String(t)}")
        }
      case MalformedRequestContentRejection(_, t: ParsingFailure) =>
        extractActorSystem { system =>
          system.log.error(t, "Parsing failure")
          complete(StatusCodes.BadRequest -> s"Parsing Failure: ${t.message}")
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
