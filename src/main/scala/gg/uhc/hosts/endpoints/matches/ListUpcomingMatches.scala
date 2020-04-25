package gg.uhc.hosts.endpoints.matches

import akka.NotUsed
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.RouteDirectives.{complete, reject}
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, MergeHub, Sink, Source, SourceQueueWithComplete}
import akka.stream.{Materializer, OverflowStrategy}
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts.Instrumented
import gg.uhc.hosts.database.MatchRow
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, DatabaseErrorRejection, EndpointRejectionHandler}
import io.circe.Json
import io.circe.syntax._

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class ListUpcomingMatches(cache: BasicCache, materializer: Materializer, customDirectives: CustomDirectives) extends Instrumented {
  implicit val mz: Materializer = materializer

  private[this] val upcomingMatchesTimer   = metrics.timer("upcoming-matches-request-time")
  private[this] val upcomingMatchesCounter = metrics.counter("upcoming-matches-request-count")

  val connectedClientsQueue: SourceQueueWithComplete[Int] = Source
    .queue[Int](0, OverflowStrategy.backpressure)
    .conflate(_ + _)
    .scan(0)(_ + _)
    .log("connected client count")
    .toMat(Sink.ignore)(Keep.left)
    .run()

  val (newMatchesSink: Sink[MatchRow, NotUsed], newGamesSource: Source[Message, NotUsed]) =
    MergeHub
      .source[MatchRow]
      .map(data => TextMessage(data.asJson.noSpaces))
      .log("message", m => m.getStrictText)
      .toMat(BroadcastHub.sink[Message])(Keep.both)
      .run()

  def onNewMatchCreated(m: MatchRow): NotUsed = Source.single(m).runWith(newMatchesSink)

  def currentUpcomingGamesList(): Source[Json, NotUsed] = Source.future(cache.getUpcomingMatches)

  def listenForNewGamesFlow(implicit ec: ExecutionContext): Flow[Any, Message, NotUsed] = Flow.fromSinkAndSourceCoupled(
    // we don't care about any messages the client sends
    Sink.ignore,
    // first increment the client count
    Source
      .futureSource(connectedClientsQueue.offer(1).map(_ => Source.empty))
      // then send our current view of upcoming matches
      .concat(currentUpcomingGamesList().map(data => TextMessage(data.noSpaces)))
      // then emit new matches as they appear
      // we add a buffer so we don't backpressure the broadcasthub and
      // fail the source if it fills up because one client isn't consuming
      // the messages quick enough
      // TODO backpressure timeout?
      .concat(newGamesSource.buffer(32, OverflowStrategy.fail))
      // decrement client count
      .watchTermination() { (_, done) =>
        done.onComplete(_ => connectedClientsQueue.offer(-1))
      }
  )

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      concat(
        pathEndOrSingleSlash {
          (timed(upcomingMatchesTimer) & counting(upcomingMatchesCounter)) {
            val json = currentUpcomingGamesList().toMat(Sink.last)(Keep.right).run()

            onComplete(json) {
              case Success(value) => complete(value)
              case Failure(t) => reject(DatabaseErrorRejection(t))
            }
          }
        },
        path("listen") {
          customDirectives.requireApiTokenAuthentication { session =>
            customDirectives.requirePermission("admin", session.username) {
              extractUpgradeToWebSocket { upgrade =>
                extractExecutionContext { implicit ec =>
                  complete(upgrade.handleMessages(listenForNewGamesFlow))
                }
              }
            }
          }
        }
      )
    }
}
