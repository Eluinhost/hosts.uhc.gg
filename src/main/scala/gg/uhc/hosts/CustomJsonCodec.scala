package gg.uhc.hosts

import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import gg.uhc.hosts.database.MatchRow
import gg.uhc.hosts.endpoints.matches.websocket.WebsocketEvent
import io.circe.{Encoder, Json, JsonObject}
import io.circe.syntax._
import io.circe.generic.AutoDerivation

trait CustomJsonCodec extends FailFastCirceSupport with AutoDerivation

object CustomJsonCodec extends CustomJsonCodec {
  implicit class MatchRowExtensions(m: MatchRow) {
    def toJsonWithRoles(roles: List[String]): JsonObject =
      m.asJsonObject.add("roles", roles.asJson)
  }

  implicit class WebsocketEventExtensions[P, M](e: WebsocketEvent[P, M]) {
    def toJsonEvent(implicit payloadEncoder: Encoder[P], metaEncoder: Encoder[M]): Json = Json.obj(
      ("type", Json.fromString(e.event)),
      ("payload", e.payload.asJson),
      ("meta", e.meta.asJson)
    )
  }
}
