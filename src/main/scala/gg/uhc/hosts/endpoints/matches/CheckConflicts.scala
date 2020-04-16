package gg.uhc.hosts.endpoints.matches

import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import akka.http.scaladsl.unmarshalling.Unmarshaller
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

case class ConflictCheck(opens: Instant, region: String, version: String)

class CheckConflicts(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def parseOpens: Unmarshaller[String, Instant] = Unmarshaller.strict[String, Instant](Instant.parse(_))

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      parameter("opens".as(parseOpens)) { opens =>
        parameter("version") { version =>
          parameter("region") { region =>
            val start = opens.minus(15, ChronoUnit.MINUTES)
            val end   = opens.plus(15, ChronoUnit.MINUTES)

            requireSucessfulQuery(
              database.getPotentialConflicts(start = start, end = end, region = region, version = version)) {
              conflicts =>
                complete(conflicts)
            }
          }
        }
      }
    }
}
