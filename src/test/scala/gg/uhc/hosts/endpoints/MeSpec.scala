package gg.uhc.hosts.endpoints

import gg.uhc.hosts.authentication.{SessionCookie, SessionPolicy, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.authentication.Me
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.headers.{Cookie, `Set-Cookie`}
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.apache.pekko.http.scaladsl.unmarshalling.{PredefinedFromEntityUnmarshallers, Unmarshal}
import org.scalamock.stubs.Stubs

import java.net.InetAddress
import java.time.{Duration, Instant}
import scala.concurrent.Await
import scala.concurrent.duration.*

class MeSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("me-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private val policy = SessionPolicy(Duration.ofDays(8), Duration.ofDays(90), Duration.ofDays(1))

  private class Fixture {
    val db         = stub[Database]
    val sessions   = new StubbedSessionStore(stub[SessionStore])
    val directives = new CustomDirectives(db, sessions.store)
    val me         = new Me(directives, sessions.store, policy)
  }

  private def bodyOf(response: HttpResponse): String =
    Await.result(Unmarshal(response.entity).to[String], 5.seconds)

  private def withCookie(id: String) = Get("/").addHeader(Cookie(SessionCookie.name, id))

  private def withCookieAndIp(id: String, ip: String) =
    Get("/")
      .addHeader(Cookie(SessionCookie.name, id))
      .addAttribute(AttributeKeys.remoteAddress, RemoteAddress(InetAddress.getByName(ip)))

  private def sessionCookie(response: HttpResponse) =
    response.headers.collect { case `Set-Cookie`(c) => c }.find(_.name == SessionCookie.name)

  test("the response is claims, and nothing else") {
    val f        = new Fixture
    val id       = f.sessions.add("me_user", List("host", "moderator"))
    val response = runRoute(f.me(), withCookie(id))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(
      bodyOf(response),
      """{"username":"me_user","permissions":["host","moderator"]}""",
      "no expires field: expiry belongs to the cookie, not to the body"
    )
    assertEquals(f.sessions.store.lookup.calls, List(id))
    assertEquals(f.db.run.times, 0)
  }

  test("no cookie is a 401") {
    val f = new Fixture
    assertEquals(runRoute(f.me(), Get("/")).status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.lookup.times, 0)
  }

  test("a bad cookie is a 401") {
    val f = new Fixture
    assertEquals(runRoute(f.me(), withCookie("not-a-session-id")).status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.lookup.calls, List("not-a-session-id"))
  }

  test("an expired session is a 401") {
    val f  = new Fixture
    val id = f.sessions.add("dead_user")

    f.sessions.expire(id)

    assertEquals(runRoute(f.me(), withCookie(id)).status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.touch.times, 0)
  }

  test("the cookie is left alone if not hit the rotate interval yet") {
    val f        = new Fixture
    val id       = f.sessions.add("steady_user")
    val response = runRoute(f.me(), withCookie(id))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(sessionCookie(response), None)
    assertEquals(f.sessions.store.rotate.times, 0)
  }

  test("once past the rotate interval the session is regenerated") {
    val f  = new Fixture
    val id = f.sessions.add("rotating_user")
    f.sessions.ageLastRotated(id, 2)

    val response = runRoute(f.me(), withCookie(id))
    val rotated  = sessionCookie(response)

    assertEquals(response.status, StatusCodes.OK)
    assert(rotated.isDefined)

    val newId = rotated.get.value
    assert(newId.nonEmpty && newId != id)
    assertEquals(f.sessions.entry(id), None)
    assert(f.sessions.entry(newId).isDefined)
    assertEquals(f.sessions.entry(newId).get.username, "rotating_user")
    assertEquals(f.sessions.store.rotate.times, 1)
    assertEquals(f.sessions.store.touch.times, 0)
  }

  test("every call slides the idle window") {
    val f      = new Fixture
    val id     = f.sessions.add("sliding_user")
    f.sessions.ageLastSeen(id, 7)
    val before = f.sessions.entry(id).get.lastSeen

    assertEquals(runRoute(f.me(), withCookie(id)).status, StatusCodes.OK)

    assert(f.sessions.entry(id).get.lastSeen.isAfter(before))
    assertEquals(f.sessions.store.touch.calls, List(id))
  }

  test("the rotated cookie expires at the absolute cap") {
    val f  = new Fixture
    val id = f.sessions.add("capped_user")
    f.sessions.ageLastRotated(id, 2)
    f.sessions.setAbsoluteExpiry(id, Instant.now().plusSeconds(1800))

    val response = runRoute(f.me(), withCookie(id))
    val rotated  = sessionCookie(response)

    assertEquals(response.status, StatusCodes.OK)
    assert(rotated.isDefined)

    val expires = rotated.get.expires.getOrElse(fail("the rotated cookie must carry an expiry"))
    assert(
      expires > DateTime(System.currentTimeMillis()),
      "a cookie that expires in the past logs the user out mid-session"
    )
    assert(
      expires <= DateTime(Instant.now().plusSeconds(1800).toEpochMilli + 1000),
      "the cookie must not outlive the absolute cap, which is the whole point of the cap"
    )
  }

  test("rotation stamps lastRotated and skips rotating within the window") {
    val f  = new Fixture
    val id = f.sessions.add("throttled_user")
    f.sessions.ageLastRotated(id, 2)

    val response = runRoute(f.me(), withCookie(id))
    val newId    = sessionCookie(response).get.value

    assert(
      f.sessions.entry(newId).get.lastRotated.isAfter(Instant.now().minus(Duration.ofMinutes(5)))
    )

    assertEquals(
      sessionCookie(runRoute(f.me(), withCookie(newId))),
      None
    )
  }

  test("rotation restarts the idle window from this request, not from the stale lastSeen") {
    val f  = new Fixture
    val id = f.sessions.add("sliding_rotate_user")
    f.sessions.ageLastSeen(id, 7)
    f.sessions.ageLastRotated(id, 2)

    val expires = sessionCookie(runRoute(f.me(), withCookie(id))).get.expires
      .getOrElse(fail("the rotated cookie must carry an expiry"))

    assert(
      expires > DateTime(Instant.now().plus(Duration.ofDays(7)).toEpochMilli)
    )
  }

  test("the 401 carries no challenge") {
    val f        = new Fixture
    val response = runRoute(f.me(), Get("/"))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assert(
      response.headers.find(_.name == "WWW-Authenticate").isEmpty
    )
  }

  test("the authentication log is written on rotation, not on every poll") {
    val f  = new Fixture
    val id = f.sessions.add("logged_user")

    assertEquals(runRoute(f.me(), withCookieAndIp(id, "203.0.113.9")).status, StatusCodes.OK)
    assertEquals(
      f.sessions.store.logAccess.times,
      0
    )

    f.sessions.ageLastRotated(id, 2)
    assertEquals(runRoute(f.me(), withCookieAndIp(id, "203.0.113.9")).status, StatusCodes.OK)
    assertEquals(
      f.sessions.store.logAccess.calls,
      List(("logged_user", Some(InetAddress.getByName("203.0.113.9"))))
    )
  }
}
