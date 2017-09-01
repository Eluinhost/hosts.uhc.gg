package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.model.headers.HttpChallenges
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive0}
import akka.http.scaladsl.server.Directives._

object Permissions {
  val base: List[String] = "trial host" :: "host" :: "hosting advisor" :: "ubl moderator" :: "admin" :: Nil

  // Map of user permission to allowed permissions for adding/removal
  val allowedModifications: Map[String, List[String]] = Map(
    "hosting advisor" → List("trial host", "host"),
    "admin"           → base.filter(_ != "admin")
  )

  def requireCanModifyPermission(userPermissions: List[String], attempting: String): Directive0 = {
    val canModify = userPermissions
      .flatMap(allowedModifications.getOrElse(_, List.empty))
      .contains(attempting)

    if (canModify)
      pass
    else
      reject(
        AuthenticationFailedRejection(
          AuthenticationFailedRejection.CredentialsRejected,
          HttpChallenges.basic("reddit")
        )
      )
  }
}
