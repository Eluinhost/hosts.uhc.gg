package gg.uhc.hosts.reddit

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model.{HttpRequest, HttpResponse}
import org.apache.pekko.stream.scaladsl.{Keep, Sink, Source}
import org.apache.pekko.stream.{Materializer, QueueOfferResult, ThrottleMode}

import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success}

class ApiConsumer(system: ActorSystem, host: String, queueSize: Int) {
  import scala.concurrent.duration._

  implicit val s: ActorSystem = system
  implicit val mz: Materializer = Materializer.matFromSystem
  implicit val ec: ExecutionContext = system.dispatcher

  private val pool = Http().cachedHostConnectionPoolHttps[Promise[HttpResponse]](host)

  private val queue = Source
    .queue[(HttpRequest, Promise[HttpResponse])](queueSize)
    .throttle(30, 1.minute, 1, ThrottleMode.Shaping)
    .via(pool)
    .toMat(Sink.foreach({
      case ((Success(response), promise))  => promise.success(response)
      case ((Failure(exception), promise)) => promise.failure(exception)
    }))(Keep.left)
    .run()

  def queueRequest(request: HttpRequest): Future[HttpResponse] = {
    val promise = Promise[HttpResponse]()

    queue.offer(request -> promise) match {
      case QueueOfferResult.Enqueued    => promise.future
      case QueueOfferResult.Dropped     => Future failed new RuntimeException("Queue overflowed")
      case QueueOfferResult.Failure(ex) => Future failed ex
      case QueueOfferResult.QueueClosed => Future failed new RuntimeException("Queue closed")
    }
  }
}
