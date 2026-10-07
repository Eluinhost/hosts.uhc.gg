package gg.uhc.hosts.endpoints

import gg.uhc.hosts.authentication.{SessionCookie, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.Database
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.headers.{Authorization, BasicHttpCredentials, Cookie, RawHeader}
import org.apache.pekko.http.scaladsl.model.{HttpHeader, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.scalamock.stubs.Stubs

class CsrfSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("csrf-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private val db         = stub[Database]
  private val sessions   = new StubbedSessionStore(stub[SessionStore])
  private val directives = new CustomDirectives(db, sessions.store)

  private val guarded = handleRejections(EndpointRejectionHandler()) {
    directives.csrfGuard {
      complete(StatusCodes.OK)
    }
  }

  private def postWith(headers: HttpHeader*) = Post("/").withHeaders(headers.toList)

  test("a mutating request with a session cookie and no csrf header is forbidden") {
    assertEquals(runRoute(guarded, postWith(Cookie(SessionCookie.name, "any"))).status, StatusCodes.Forbidden)
  }

  test("a mutating request with a session cookie and the csrf header passes") {
    assertEquals(
      runRoute(guarded, postWith(Cookie(SessionCookie.name, "any"), RawHeader("X-CSRF", "1"))).status,
      StatusCodes.OK
    )
  }

  test("a mutation with no session cookie is exempt") {
    assertEquals(
      runRoute(guarded, postWith(Authorization(BasicHttpCredentials("tool", "key")))).status,
      StatusCodes.OK,
      "no session cookie means CSRF-ineligible"
    )
  }

  test("a GET with a session cookie is never csrf checked, a DELETE is") {
    assertEquals(runRoute(guarded, Get("/").addHeader(Cookie(SessionCookie.name, "any"))).status, StatusCodes.OK)
    assertEquals(
      runRoute(guarded, Delete("/").addHeader(Cookie(SessionCookie.name, "any"))).status,
      StatusCodes.Forbidden
    )
  }

  test("a cross-site Sec-Fetch-Site is rejected even with the csrf header") {
    assertEquals(
      runRoute(
        guarded,
        postWith(
          Cookie(SessionCookie.name, "any"),
          RawHeader("X-CSRF", "1"),
          RawHeader("Sec-Fetch-Site", "cross-site")
        )
      ).status,
      StatusCodes.Forbidden
    )
  }

  test("a same-origin Sec-Fetch-Site passes") {
    assertEquals(
      runRoute(
        guarded,
        postWith(
          Cookie(SessionCookie.name, "any"),
          RawHeader("X-CSRF", "1"),
          RawHeader("Sec-Fetch-Site", "same-origin")
        )
      ).status,
      StatusCodes.OK
    )
  }

  test("a same-site Sec-Fetch-Site is rejected: the allowlist is not a licence for a subdomain") {
    assertEquals(
      runRoute(
        guarded,
        postWith(
          Cookie(SessionCookie.name, "any"),
          RawHeader("X-CSRF", "1"),
          RawHeader("Sec-Fetch-Site", "same-site")
        )
      ).status,
      StatusCodes.Forbidden
    )
  }

  test("PUT and PATCH are mutating methods too") {
    assertEquals(runRoute(guarded, Put("/").addHeader(Cookie(SessionCookie.name, "any"))).status, StatusCodes.Forbidden)
    assertEquals(
      runRoute(guarded, Patch("/").addHeader(Cookie(SessionCookie.name, "any"))).status,
      StatusCodes.Forbidden
    )
  }

  test("an Origin outside the allowlist is rejected when Sec-Fetch-Site is absent") {
    assertEquals(
      runRoute(
        guarded,
        postWith(
          Cookie(SessionCookie.name, "any"),
          RawHeader("X-CSRF", "1"),
          RawHeader("Origin", "https://evil.example")
        )
      ).status,
      StatusCodes.Forbidden
    )
  }

  test("an Origin inside the allowlist passes when Sec-Fetch-Site is absent") {
    assertEquals(
      runRoute(
        guarded,
        postWith(
          Cookie(SessionCookie.name, "any"),
          RawHeader("X-CSRF", "1"),
          RawHeader("Origin", "https://hosts.uhc.gg")
        )
      ).status,
      StatusCodes.OK
    )
  }

  test("a non-1 X-CSRF value is rejected") {
    assertEquals(
      runRoute(guarded, postWith(Cookie(SessionCookie.name, "any"), RawHeader("X-CSRF", "yes"))).status,
      StatusCodes.Forbidden
    )
  }

  test("the csrf guard decides without consulting the session store or the database") {
    assertEquals(
      runRoute(guarded, postWith(Cookie(SessionCookie.name, "any"), RawHeader("X-CSRF", "1"))).status,
      StatusCodes.OK
    )
    assertEquals(runRoute(guarded, postWith(Cookie(SessionCookie.name, "any"))).status, StatusCodes.Forbidden)
    assertEquals(
      runRoute(guarded, postWith(Authorization(BasicHttpCredentials("tool", "key")))).status,
      StatusCodes.OK,
    )

    assertEquals(sessions.store.lookup.times, 0)
    assertEquals(db.run.times, 0)
  }
}
