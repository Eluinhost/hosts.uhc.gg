package gg.uhc.hosts.endpoints.permissions

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.syntax.EncoderOps

class ListUserCountForEachPermission(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def addPermIfNotExists(perm: String, m: Map[String, Int]): Map[String, Int] =
    if (m.contains(perm)) m else m + (perm -> 0)

  def addBasePerms: (Map[String, Int]) => Map[String, Int] =
    Permissions.base.foldRight[Map[String, Int]](_)(addPermIfNotExists)

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getUserCountForEachPermission()) { perms =>
        complete(addBasePerms(perms).asJson)
      }
    }
}
