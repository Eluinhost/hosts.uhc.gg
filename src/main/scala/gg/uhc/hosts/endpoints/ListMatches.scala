package gg.uhc.hosts.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{RejectionHandler, Route}
import gg.uhc.hosts.{CustomJsonCodec, Database}

object ListMatches {
  import CustomJsonCodec._

  private[this] val rejectionHandler = RejectionHandler
    .newBuilder()
    .handle {
      case _ ⇒ complete(StatusCodes.InternalServerError)
    }
    .result()

  val route: Route =
    handleRejections(rejectionHandler) {
      Database.requireSucessfulQuery(Database.list) { items ⇒
        complete(items)
      }
    }
}
