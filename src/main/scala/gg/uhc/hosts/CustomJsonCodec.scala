package gg.uhc.hosts

import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import gg.uhc.hosts.database.MatchRow
import io.circe.JsonObject
import io.circe.syntax._
import io.circe.generic.AutoDerivation

trait CustomJsonCodec extends FailFastCirceSupport with AutoDerivation

object CustomJsonCodec extends CustomJsonCodec {
  implicit class MatchRowExtensions(m: MatchRow) {
    def toJsonWithRoles(roles: List[String]): JsonObject =
      m.asJsonObject.add("roles", roles.asJson)
  }
}
