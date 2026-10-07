package gg.uhc.hosts.endpoints.authentication

import java.time.Instant

import org.apache.pekko.http.scaladsl.model.RemoteAddress
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.authentication.{SessionCookie, SessionId, SessionPolicy, SessionStore}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

case class MeResponse(username: String, permissions: List[String])

class Me(directives: CustomDirectives, sessions: SessionStore, policy: SessionPolicy) {
  import CustomJsonCodec.*
  import directives.*

  def apply(): Route = handleRejections(EndpointRejectionHandler()) {
    requireSessionAuthenticationWithId { case (auth, session) =>
      extractClientIP { clientIp =>
        val now = Instant.now()

        if policy.shouldRotate(session.lastRotated, now) then
          val newId     = SessionId.generate()
          val expiresAt = policy.expiresAt(now, session.absoluteExpiry, now)

          requireSucessfulFuture(sessions.rotate(session.id, newId)) { _ =>
            setCookie(SessionCookie.from(newId, expiresAt)) {
              logThenComplete(auth.username, auth.permissions, clientIp)
            }
          }
        else
          requireSucessfulFuture(sessions.touch(session.id)) { _ =>
            complete(MeResponse(auth.username, auth.permissions))
          }
      }
    }
  }

  private def logThenComplete(username: String, permissions: List[String], clientIp: RemoteAddress): Route =
    clientIp match {
      case RemoteAddress.IP(ip, _) =>
        requireSucessfulFuture(sessions.logAccess(username, Some(ip))) { _ =>
          complete(MeResponse(username, permissions))
        }
      case RemoteAddress.Unknown   => complete(MeResponse(username, permissions))
    }
}
