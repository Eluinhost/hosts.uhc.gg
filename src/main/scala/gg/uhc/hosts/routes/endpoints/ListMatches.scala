package gg.uhc.hosts.routes.endpoints

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{RejectionHandler, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.routes.CustomDirectives

class ListMatches(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  private[this] val rejectionHandler = RejectionHandler
    .newBuilder()
    .handle {
      case _ ⇒ complete(StatusCodes.InternalServerError)
    }
    .result()

  val route: Route =
    handleRejections(rejectionHandler) {
      requireSucessfulQuery(database.listMatches) { items ⇒
        complete(items)
      }
    }
}
