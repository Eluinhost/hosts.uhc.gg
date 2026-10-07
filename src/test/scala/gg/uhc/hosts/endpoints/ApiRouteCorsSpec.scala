package gg.uhc.hosts.endpoints

import com.softwaremill.tagging.*
import gg.uhc.hosts.{HttpSystem, RedditApiSystem}
import gg.uhc.hosts.authentication.{SessionCookie, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.Database
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.{HttpHeader, HttpRequest, StatusCodes}
import org.apache.pekko.http.scaladsl.model.headers.{`Access-Control-Allow-Origin`, Cookie, HttpOrigin, RawHeader}
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.scalamock.stubs.Stubs

class ApiRouteCorsSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("api-cors-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private val db       = stub[Database]
  private val sessions = new StubbedSessionStore(stub[SessionStore])

  private val directives = new CustomDirectives(db, sessions.store)

  (() => db.ec).returnsWith(system.dispatcher)

  private def corsRoute = directives.echoCorsOrigin { complete("ok") }

  private def headersOf(request: HttpRequest): List[HttpHeader] = runRoute(corsRoute, request).headers.toList

  private def allowOriginOf(request: HttpRequest): List[HttpHeader] =
    headersOf(request).collect { case h: `Access-Control-Allow-Origin` => h }

  private class TestEndpointsModule extends EndpointsModule {
    override def database: Database                              = db
    override lazy val sessionStore: SessionStore                 = sessions.store
    override def httpSystem: ActorSystem @@ HttpSystem           = system.taggedWith[HttpSystem]
    override def redditApiSystem: ActorSystem @@ RedditApiSystem = system.taggedWith[RedditApiSystem]
  }

  private val api = new TestEndpointsModule().apiRoute

  test("an allowlisted origin is echoed") {
    assertEquals(
      allowOriginOf(Get("/").addHeader(RawHeader("Origin", "https://c.uhc.gg"))),
      List(`Access-Control-Allow-Origin`(HttpOrigin("https://c.uhc.gg")))
    )
  }

  test("an origin outside the allowlist gets no access control header") {
    assertEquals(allowOriginOf(Get("/").addHeader(RawHeader("Origin", "https://evil.example"))), Nil)
  }

  test("a request with no origin gets no access control header") {
    assertEquals(allowOriginOf(Get("/")), Nil)
  }

  test("every cors response varies on Origin so caches cannot mix origins") {
    val vary = headersOf(Get("/").addHeader(RawHeader("Origin", "https://c.uhc.gg")))
      .collect { case RawHeader("Vary", v) => v }

    assertEquals(vary, List("Origin"))
  }

  test("a request with no origin still varies on Origin, because the header is conditional") {
    val vary = headersOf(Get("/")).collect { case RawHeader("Vary", v) => v }

    assertEquals(vary, List("Origin"))
  }

  test("credentials are never allowed") {
    val headers = headersOf(Get("/").addHeader(RawHeader("Origin", "https://c.uhc.gg")))

    assert(!headers.exists(_.name.toLowerCase.contains("allow-credentials")))
  }

  test("a csrf rejection reaches the SPA as a 403 through the real ApiRoute") {
    val response = runRoute(api(), Post("/sync").addHeader(Cookie(SessionCookie.name, "any")))

    assertEquals(response.status, StatusCodes.Forbidden)
    assertEquals(response.headers.collect { case RawHeader("Cache-Control", v) => v }.toList, List("no-store"))
  }

  test("the real ApiRoute answers 401 with Cache-Control: no-store and no wildcard origin") {
    val response = runRoute(api(), Get("/me"))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(
      response.headers.collect { case RawHeader("Cache-Control", v) => v }.toList,
      List("no-store")
    )
    assert(!response.headers.exists(_.name == "Access-Control-Allow-Origin"))
  }

  test("the real ApiRoute echoes an allowlisted origin on a 200 response") {
    val response = runRoute(api(), Get("/sync").addHeader(RawHeader("Origin", "https://c.uhc.gg")))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(
      response.headers.collect { case h: `Access-Control-Allow-Origin` => h }.toList,
      List(`Access-Control-Allow-Origin`(HttpOrigin("https://c.uhc.gg")))
    )
    assertEquals(
      response.headers.collect { case RawHeader("Vary", v) => v }.toList,
      List("Origin")
    )
  }

  test("the cors and csrf checks answer without a database query") {
    val echo = runRoute(api(), Get("/sync").addHeader(RawHeader("Origin", "https://c.uhc.gg")))
    val me   = runRoute(api(), Get("/me"))
    val csrf = runRoute(api(), Post("/sync").addHeader(Cookie(SessionCookie.name, "any")))

    assertEquals(echo.status, StatusCodes.OK)
    assertEquals(me.status, StatusCodes.Unauthorized)
    assertEquals(csrf.status, StatusCodes.Forbidden)

    assertEquals(db.run.times, 0)
    assertEquals(sessions.store.lookup.times, 0)
  }
}
