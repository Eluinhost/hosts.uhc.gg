package gg.uhc.hosts.endpoints.frontend

import java.util.concurrent.TimeUnit

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.RouteResult.Complete
import akka.http.scaladsl.server.directives.MethodDirectives.get
import akka.http.scaladsl.server.{Directive0, Route}
import akka.stream.Materializer
import akka.util.ByteString
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.TwirlSupport

import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration
import scala.util.Success

class FrontendRoute(database: Database, materializer: Materializer) extends TwirlSupport {
  implicit val mz: Materializer = materializer

  private[this] val basicFrontend: Route = getFromFile("frontend/build/index.html")

  def addMetaTags(input: ByteString, title: String, description: String): ByteString =
    ByteString(
      input.utf8String.replaceFirst("__META_TAG_TITLE__", title).replaceFirst("__META_TAG_DESCRIPTION__", description))

  private[this] def withMatchTitle(title: String, description: String): Directive0 = extractExecutionContext.flatMap {
    implicit ec =>
      mapRouteResultWith({
        case result @ Complete(response) =>
          response.entity
            .toStrict(FiniteDuration(30, TimeUnit.SECONDS))
            .map(entity => entity.copy(data = addMetaTags(entity.data, title, description)))
            .map(entity => result.copy(response = response.mapEntity(_ => entity)))
        case other => Future.successful(other)
      })
  }

  def apply(): Route =
    (get & path("m" / IntNumber)) { id =>
      onComplete(database.run(database.matchById(id))) {
        // send the frontend with the basic details about the game for previewers to view
        case Success(Some(m)) =>
          withMatchTitle(m.legacyTitle(), "Match Post") {
            basicFrontend
          }
        // if it fails to lookup just return the regular frontend
        case _ => basicFrontend
      }
    } ~
      getFromDirectory("frontend/build") ~
      withMatchTitle("uhc.gg", "uhc.gg") {
        basicFrontend
      }

}
