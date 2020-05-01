package gg.uhc.hosts.endpoints.matches.websocket

import akka.NotUsed
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives.{extractExecutionContext, extractUpgradeToWebSocket}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.RouteDirectives.complete
import akka.stream.{Materializer, OverflowStrategy}
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, MergeHub, Sink, Source, SourceQueueWithComplete}
import gg.uhc.hosts.database.MatchRow
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives}
import io.circe.{Json, Printer}

import scala.concurrent.ExecutionContext

class MatchesWebsocket(materializer: Materializer, cache: BasicCache, customDirectives: CustomDirectives) {
  implicit val mz: Materializer = materializer

  private[this] val connectedClientsQueue: SourceQueueWithComplete[Int] = Source
    .queue[Int](0, OverflowStrategy.backpressure)
    .conflate(_ + _)
    .scan(0)(_ + _)
    .log("connected client count")
    .toMat(Sink.ignore)(Keep.left)
    .run()

  private[this] val (messageSink: Sink[Json, NotUsed], messageSource: Source[Message, NotUsed]) =
    MergeHub
      .source[Json]
      .log("message", m => m.printWith(Printer.spaces4SortKeys))
      .map(input => TextMessage(input.noSpaces))
      .toMat(BroadcastHub.sink[Message])(Keep.both)
      .run()

  // make sure there is always a consumer so items don't build up and send to the first consumer
  messageSource.runWith(Sink.ignore)

  private[this] def currentUpcomingGamesListMessage(): Source[Message, NotUsed] =
    Source.future(cache.getUpcomingMatches).map(x => TextMessage(new UpcomingMatchesEvent(x).toJsonEvent.noSpaces))

  private[this] def websocketFlow(implicit ec: ExecutionContext): Flow[Any, Message, NotUsed] = Flow.fromSinkAndSourceCoupled(
    // we don't care about any messages the client sends
    Sink.ignore,
    // first increment the client count
    Source
      .futureSource(connectedClientsQueue.offer(1).map(_ => Source.empty))
      // then send our current view of upcoming matches
      .concat(currentUpcomingGamesListMessage())
      // then emit new events as they appear
      // we add a buffer so we don't backpressure the broadcasthub and
      // fail the source if it fills up because one client isn't consuming
      // the messages quick enough
      // TODO backpressure timeout?
      .concat(messageSource.buffer(32, OverflowStrategy.fail))
      // decrement client count
      .watchTermination() { (_, done) =>
        done.onComplete(_ => connectedClientsQueue.offer(-1))
      }
  )

  def notifyMatchCreated(m: MatchRow): NotUsed =
    Source.single(new MatchCreatedEvent(m).toJsonEvent).runWith(messageSink)

  def notifyMatchRemoved(m: MatchRow): NotUsed =
    Source.single(new MatchRemovedEvent(m).toJsonEvent).runWith(messageSink)

  val route: Route =
    customDirectives.requireApiTokenAuthentication { session =>
      customDirectives.requirePermission("admin", session.username) {
        extractUpgradeToWebSocket { upgrade =>
          extractExecutionContext { implicit ec =>
            complete(upgrade.handleMessages(websocketFlow))
          }
        }
      }
    }
}
