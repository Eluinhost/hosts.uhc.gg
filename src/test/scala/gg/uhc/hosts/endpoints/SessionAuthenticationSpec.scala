package gg.uhc.hosts.endpoints

import gg.uhc.hosts.authentication.{SessionCookie, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.Database
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.headers.Cookie
import org.apache.pekko.http.scaladsl.model.{HttpResponse, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import org.scalamock.stubs.Stubs

import scala.concurrent.Await
import scala.concurrent.duration.*

class SessionAuthenticationSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("session-auth-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private class Fixture {
    val db         = stub[Database]
    val sessions   = new StubbedSessionStore(stub[SessionStore])
    val directives = new CustomDirectives(db, sessions.store)
  }

  private def bodyOf(response: HttpResponse): String =
    Await.result(Unmarshal(response.entity).to[String], 5.seconds)

  private def withCookie(id: String) = Get("/").addHeader(Cookie(SessionCookie.name, id))

  test("a valid session cookie authenticates the user") {
    val f        = new Fixture
    val id       = f.sessions.add("session_user", List("host"))
    val route    = f.directives.requireSessionAuthentication { auth => complete(auth.username) }
    val response = runRoute(route, withCookie(id))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(bodyOf(response), "session_user")
    assertEquals(f.sessions.store.lookup.calls, List(id))
    assertEquals(f.db.run.times, 0)
  }

  test("permissions are read from storage on every request") {
    val f     = new Fixture
    val id    = f.sessions.add("revoked_user", List("host"))
    val route = f.directives.requireSessionAuthentication { auth => complete(auth.permissions.mkString(",")) }

    assertEquals(bodyOf(runRoute(route, withCookie(id))), "host")

    f.sessions.setPermissions(id, Nil)

    assertEquals(
      bodyOf(runRoute(route, withCookie(id))),
      ""
    )
    assertEquals(f.sessions.store.lookup.times, 2)
  }

  test("no cookie is a 401") {
    val f     = new Fixture
    val route = f.directives.requireSessionAuthentication { auth => complete(auth.username) }

    assertEquals(runRoute(route, Get("/")).status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.lookup.times, 0)
  }

  test("a bad cookie value is a 401") {
    val f        = new Fixture
    val route    = f.directives.requireSessionAuthentication { auth => complete(auth.username) }
    val response = runRoute(route, withCookie("not-a-session-id"))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.lookup.calls, List("not-a-session-id"))
  }

  test("an expired session is a 401") {
    val f     = new Fixture
    val id    = f.sessions.add("dead_user")
    val route = f.directives.requireSessionAuthentication { auth => complete(auth.username) }

    f.sessions.expire(id)

    assertEquals(runRoute(route, withCookie(id)).status, StatusCodes.Unauthorized)
    assertEquals(f.sessions.store.lookup.times, 1)
  }

  test("the withId version of the directive hands the live session to the caller") {
    val f     = new Fixture
    val id    = f.sessions.add("rotating_user")
    val route = f.directives.requireSessionAuthenticationWithId { case (_, session) => complete(session.id) }

    assertEquals(bodyOf(runRoute(route, withCookie(id))), id)
    assertEquals(f.sessions.store.lookup.times, 1)
  }

  test("the optional session directive provides None") {
    val f     = new Fixture
    val route =
      f.directives.optionalSessionAuthentication { maybe => complete(maybe.map(_.username).getOrElse("none")) }

    assertEquals(bodyOf(runRoute(route, Get("/"))), "none")
    assertEquals(f.sessions.store.lookup.times, 0)
  }

  test("a dead cookie falls through to the api key stage") {
    val f        = new Fixture
    val route    = f.directives.requireAuthentication { auth => complete(auth.username) }
    val response = runRoute(route, withCookie("not-a-session-id"))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assert(
      response.headers.exists(h => h.name == "WWW-Authenticate" && h.value.contains("""realm="user api token"""))
    )
    assertEquals(f.sessions.store.lookup.calls, List("not-a-session-id"))
    assertEquals(f.db.run.times, 0)
  }
}
