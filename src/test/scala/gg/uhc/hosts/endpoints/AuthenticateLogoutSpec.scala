package gg.uhc.hosts.endpoints

import gg.uhc.hosts.authentication.{SessionCookie, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.authentication.AuthenticateLogout
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.model.headers.{`Set-Cookie`, Cookie}
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.scalamock.stubs.Stubs

class AuthenticateLogoutSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("logout-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private class Fixture {
    val db         = stub[Database]
    val sessions   = new StubbedSessionStore(stub[SessionStore])
    val directives = new CustomDirectives(db, sessions.store)
    val logout     = new AuthenticateLogout(directives, sessions.store)
  }

  test("logout deletes the session and clears the cookie") {
    val f        = new Fixture
    val id       = f.sessions.add("logout_user")
    val response = runRoute(f.logout(), Post("/").addHeader(Cookie(SessionCookie.name, id)))

    assertEquals(response.status, StatusCodes.NoContent)
    assertEquals(f.sessions.entry(id), None)
    assertEquals(f.sessions.store.delete.calls, List(id))
    assertEquals(f.db.run.times, 0)

    val cleared = response.headers.collect { case `Set-Cookie`(c) => c }.find(_.name == SessionCookie.name)

    assert(cleared.isDefined)
    assertEquals(cleared.get.value, "")
    assert(cleared.get.expires.exists(_.clicks <= System.currentTimeMillis()))
    assert(cleared.get.secure && cleared.get.httpOnly)
    assertEquals(cleared.get.path, Some("/"))
  }

  test("logout with no cookie is a success") {
    val f = new Fixture

    assertEquals(runRoute(f.logout(), Post("/")).status, StatusCodes.NoContent)
    assertEquals(f.sessions.store.delete.times, 0)
  }

  test("logout with an unknown cookie is a success") {
    val f        = new Fixture
    val response = runRoute(f.logout(), Post("/").addHeader(Cookie(SessionCookie.name, "not-a-session-id")))

    assertEquals(response.status, StatusCodes.NoContent)
    assertEquals(f.sessions.store.delete.calls, List("not-a-session-id"))
  }
}
