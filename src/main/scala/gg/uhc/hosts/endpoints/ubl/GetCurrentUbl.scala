package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, DatabaseErrorRejection, EndpointRejectionHandler}

import scala.util.{Failure, Success}

class GetCurrentUbl(directives: CustomDirectives, database: Database, cache: BasicCache) {
  import CustomJsonCodec._

  def apply(): Route = handleRejections(EndpointRejectionHandler()) {
    onComplete(cache.getCurrentUbl) {
      case Success(value) ⇒ complete(value)
      case Failure(t)     ⇒ reject(DatabaseErrorRejection(t))
    }
  }
}
