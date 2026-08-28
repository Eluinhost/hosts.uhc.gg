package gg.uhc.hosts.endpoints.permissions

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.{Directive1, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.syntax._

class PermissionModerationLog(directives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import directives._

  private val redactedModifier = "moderation team"

  def apply(): Route =
    parameters("before".as[Int].?, "count" ? 20) { (before, count) =>
      handleRejections(EndpointRejectionHandler()) {
        validate(count >= 1 && count <= 50, "Count must be between 1-50") {
          optionalJwtAuthentication { maybeSession =>
            val canSeeModifiers: Directive1[Boolean] = maybeSession match {
              case Some(session) => checkHasAtLeastOnePermission(List("admin", "hosting advisor"), session.username)
              case None          => provide(false)
            }
            canSeeModifiers { canSee =>
              requireSucessfulQuery(database.getPermissionModerationLog(before, count)) { log =>
                val visible = if (canSee) log else log.map(_.copy(modifier = redactedModifier))
                complete(visible.asJson)
              }
            }
          }
        }
      }
    }
}
