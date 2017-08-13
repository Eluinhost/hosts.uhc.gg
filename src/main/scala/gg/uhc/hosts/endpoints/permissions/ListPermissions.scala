package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class ListPermissions(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  def addPermIfNotExists(perm: String, m: Map[String, List[String]]): Map[String, List[String]] =
    if (m.contains(perm)) m else m + (perm → List.empty)

  val basePerms: List[String] = "host" :: "moderator" :: "trial host" :: Nil

  def addBasePerms: (Map[String, List[String]]) ⇒ Map[String, List[String]] =
    basePerms.foldRight[Map[String, List[String]]](_)(addPermIfNotExists)

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getAllPermissions) { perms ⇒
        complete(addBasePerms(perms))
      }
    }
}
