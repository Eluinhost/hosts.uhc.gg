package gg.uhc.hosts

import org.apache.pekko.http.scaladsl.marshalling.ToEntityMarshaller
import org.mdedetrich.pekko.http.support.CirceHttpSupport
import gg.uhc.hosts.database.MatchRow
import gg.uhc.hosts.endpoints.matches.websocket.WebsocketEvent
import io.circe.{Encoder, Json, JsonObject, KeyEncoder, Printer}
import io.circe.syntax._
import io.circe.generic.AutoDerivation

object CustomJsonCodec extends CirceHttpSupport with AutoDerivation {
  // in scala 3 the generics from CirceHttpSupport are ambiguous for Seq/Map. Adding these explicitly here so scala
  // can make it's mind up about which to use and we don't need to add .toJson everywhere
  implicit def circeListMarshaller[A](using e: Encoder[A], P: Printer = Printer.noSpaces): ToEntityMarshaller[List[A]] =
    circeJsonMarshaller(using P).compose(list => Json.fromValues(list.map(e.apply)))

  implicit def circeMapMarshaller[K, V](using k: KeyEncoder[K], e: Encoder[V], P: Printer = Printer.noSpaces): ToEntityMarshaller[Map[K, V]] =
    circeJsonMarshaller(using P).compose(m => Json.fromFields(m.map { case (key, value) => k(key) -> e(value) }))

  implicit class MatchRowExtensions(m: MatchRow) {
    def toJsonWithRoles(roles: List[String]): JsonObject = {
      m.asJsonObject.add("roles", roles.asJson)
    }
  }

  implicit class WebsocketEventExtensions[P, M](e: WebsocketEvent[P, M]) {
    def toJsonEvent(implicit payloadEncoder: Encoder[P], metaEncoder: Encoder[M]): Json = Json.obj(
      ("type", Json.fromString(e.event)),
      ("payload", e.payload.asJson),
      ("meta", e.meta.asJson)
    )
  }
}
