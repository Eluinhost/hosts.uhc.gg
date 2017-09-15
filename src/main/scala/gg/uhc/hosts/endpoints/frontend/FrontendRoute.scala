package gg.uhc.hosts.endpoints.frontend

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akkahttptwirl.TwirlSupport
import gg.uhc.hosts.database.Database
import play.twirl.api.HtmlFormat

import scala.util.{Failure, Success}

class FrontendRoute(database: Database) extends TwirlSupport {
  private[this] val basicFrontend: HtmlFormat.Appendable =
    html.frontend.render(description = "Reddit UHC", title = "uhc.gg")

  def apply(): Route =
    concat(
      path("favicon.png") {
        getFromResource("favicon.png")
      },
      path("logo.png") {
        getFromResource("logo.png")
      },
      path("outdatedbrowser.html") {
        getFromResource("outdatedbrowser.html")
      },
      path("m" / IntNumber) { id ⇒
        onComplete(database.run(database.matchById(id))) {
          // if it fails to lookup just return the regular frontend
          case Failure(_) ⇒ complete(basicFrontend)
          // send the frontend with the basic details about the game for previewers to view
          case Success(m) ⇒
            m.map(_.legacyTitle())
              .map { title ⇒
                complete(html.frontend.render(title = title, description = "Match Post"))
              }
              .getOrElse(complete(basicFrontend))
        }
      },
      complete(basicFrontend)
    )

}
