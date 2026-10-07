package gg.uhc.hosts.endpoints.authentication

import scala.concurrent.Future

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.authentication.{SessionCookie, SessionStore}
import gg.uhc.hosts.endpoints.CustomDirectives

class AuthenticateLogout(directives: CustomDirectives, sessions: SessionStore) {
  import directives.*

  def apply(): Route =
    optionalCookie(SessionCookie.name) { maybeCookie =>
      val delete = maybeCookie match {
        case Some(cookie) if cookie.value.nonEmpty => sessions.delete(cookie.value)
        case _                                     => Future.successful(())
      }

      requireSucessfulFuture(delete) { _ =>
        setCookie(SessionCookie.expired) {
          complete(StatusCodes.NoContent)
        }
      }
    }
}
