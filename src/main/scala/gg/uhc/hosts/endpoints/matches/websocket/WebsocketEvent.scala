package gg.uhc.hosts.endpoints.matches.websocket

import gg.uhc.hosts.database.MatchRow
import io.circe.Json

sealed trait WebsocketEvent[P, M] {
  val event: String
  val payload: P
  val meta: M
}

class MatchCreatedEvent(override val payload: MatchRow) extends WebsocketEvent[MatchRow, Unit] {
  override val event = "MATCH_CREATED"
  override val meta = ()
}

class MatchRemovedEvent(override val payload: MatchRow) extends WebsocketEvent[MatchRow, Unit] {
  override val event = "MATCH_REMOVED"
  override val meta = ()
}

class UpcomingMatchesEvent(override val payload: Json) extends WebsocketEvent[Json, Unit] {
  override val event = "UPCOMING_MATCHES"
  override val meta = ()
}
