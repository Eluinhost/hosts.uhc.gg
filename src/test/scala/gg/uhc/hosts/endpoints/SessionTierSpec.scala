package gg.uhc.hosts.endpoints

import com.softwaremill.tagging.*
import doobie.*
import doobie.free.connection.pure
import gg.uhc.hosts.authentication.{SessionCookie, SessionStore, StubbedSessionStore}
import gg.uhc.hosts.database.{Database, PermissionModerationLogRow}
import gg.uhc.hosts.{HttpSystem, PureAnswers, RedditApiSystem}
import munit.FunSuite
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.headers.{Authorization, BasicHttpCredentials, Cookie, RawHeader}
import org.apache.pekko.http.scaladsl.model.*
import org.apache.pekko.http.scaladsl.server.ExceptionHandler
import org.apache.pekko.http.scaladsl.testkit.TestFrameworkInterface
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import org.scalamock.stubs.{StubbedMethod, Stubs}

import java.net.InetAddress
import java.time.Instant
import scala.concurrent.Await
import scala.concurrent.duration.*

class SessionTierSpec extends FunSuite with EndpointRouteRunner with TestFrameworkInterface with Stubs {
  override protected def createActorSystem(): ActorSystem = ActorSystem("session-tier-spec")

  def failTest(msg: String): Nothing = fail(msg)

  def testExceptionHandler: ExceptionHandler = ExceptionHandler {
    case e => throw e
  }

  private val sessionUser = "real-host"

  private val logRow = PermissionModerationLogRow(1, "real-modifier", "target", Instant.now(), "admin", true)

  private class Fixture {
    val db       = stub[Database]
    val answers  = new PureAnswers(db.run[Any])
    val sessions = new StubbedSessionStore(stub[SessionStore])

    val getPermissions: StubbedMethod[String, ConnectionIO[List[String]]] = db.getPermissions(_: String)

    (() => db.ec).returnsWith(system.dispatcher)

    getPermissions.returnsWith(pure(List("admin")))
    db.getUserApiKey.returnsWith(pure(Some("probe-key")))
    db.regnerateApiKey.returnsWith(pure("rotated-key"))
    db.addPermission.returnsWith(pure(true))
    db.removePermission.returnsWith(pure(true))
    db.getPermissionModerationLog.returnsWith(pure(List(logRow)))

    answers.install()

    val api = new TestEndpointsModule(db, sessions.store).apiRoute
  }

  private class TestEndpointsModule(db: Database, store: SessionStore) extends EndpointsModule {
    override def database: Database                              = db
    override lazy val sessionStore: SessionStore                 = store
    override def httpSystem: ActorSystem @@ HttpSystem           = system.taggedWith[HttpSystem]
    override def redditApiSystem: ActorSystem @@ RedditApiSystem = system.taggedWith[RedditApiSystem]
  }

  private val local = RemoteAddress(InetAddress.getByName("127.0.0.1"))

  private def withSession(request: HttpRequest, f: Fixture): HttpRequest =
    request
      .addHeader(Cookie(SessionCookie.name, f.sessions.add(sessionUser, List("admin"))))
      .addAttribute(AttributeKeys.remoteAddress, local)
      .addHeader(RawHeader("X-CSRF", "1"))

  private def withApiKey(request: HttpRequest): HttpRequest =
    request
      .addHeader(Authorization(BasicHttpCredentials("user", "api-key")))
      .addAttribute(AttributeKeys.remoteAddress, local)

  private def bodyOf(response: HttpResponse): String =
    Await.result(Unmarshal(response.entity).to[String], 5.seconds)

  test("an api key cannot read the api key it authenticates with") {
    val f        = new Fixture
    val response = runRoute(f.api(), withApiKey(Get("/key")))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(f.db.getUserApiKey.times, 0)
    assertEquals(f.db.run.times, 0)
  }

  test("an api key cannot rotate the api key it authenticates with") {
    val f        = new Fixture
    val response = runRoute(f.api(), withApiKey(Post("/key")))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(f.db.regnerateApiKey.times, 0)
    assertEquals(f.db.run.times, 0)
  }

  test("an api key cannot grant a permission") {
    val f        = new Fixture
    val response = runRoute(f.api(), withApiKey(Post("/permissions/host/target")))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(f.db.addPermission.times, 0)
    assertEquals(f.db.run.times, 0)
  }

  test("an api key cannot revoke a permission") {
    val f        = new Fixture
    val response = runRoute(f.api(), withApiKey(Delete("/permissions/host/target")))

    assertEquals(response.status, StatusCodes.Unauthorized)
    assertEquals(f.db.removePermission.times, 0)
    assertEquals(f.db.run.times, 0)
  }

  test("an api key reads the moderation log with the modifier redacted") {
    val f        = new Fixture
    val response = runRoute(f.api(), withApiKey(Get("/permissions/log")))

    assertEquals(response.status, StatusCodes.OK)
    val body = bodyOf(response)
    assert(body.contains("moderation team"))
    assert(!body.contains("real-modifier"))
    assertEquals(f.db.getPermissionModerationLog.calls, List((None, 20)))
    assertEquals(f.getPermissions.times, 0)
    assertEquals(f.db.run.times, 1)
  }

  test("a session cookie reads the api key") {
    val f        = new Fixture
    val response = runRoute(f.api(), withSession(Get("/key"), f))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(bodyOf(response), """{"key":"probe-key"}""")
    assertEquals(f.db.getUserApiKey.calls, List(sessionUser))
    assertEquals(f.getPermissions.times, 0)
    assertEquals(f.db.addPermission.times, 0)
    assertEquals(f.db.removePermission.times, 0)
    assertEquals(f.db.run.times, 1)
  }

  test("a session cookie rotates the api key") {
    val f        = new Fixture
    val response = runRoute(f.api(), withSession(Post("/key"), f))

    assertEquals(response.status, StatusCodes.OK)
    assertEquals(bodyOf(response), """{"key":"rotated-key"}""")
    assertEquals(f.db.regnerateApiKey.calls, List(sessionUser))
    assertEquals(f.getPermissions.times, 0)
    assertEquals(f.db.addPermission.times, 0)
    assertEquals(f.db.removePermission.times, 0)
    assertEquals(f.db.run.times, 1)
  }

  test("a session cookie grants a permission") {
    val f        = new Fixture
    val response = runRoute(f.api(), withSession(Post("/permissions/host/target"), f))

    assertEquals(response.status, StatusCodes.Created)
    assertEquals(f.db.addPermission.calls, List(("target", "host", sessionUser)))
    assertEquals(f.getPermissions.calls, List(sessionUser, "target"))
    assertEquals(
      f.db.run.times,
      2
    )
  }

  test("a session cookie revokes a permission") {
    val f        = new Fixture
    val response = runRoute(f.api(), withSession(Delete("/permissions/host/target"), f))

    assertEquals(response.status, StatusCodes.NoContent)
    assertEquals(f.db.removePermission.calls, List(("target", "host", sessionUser)))
    assertEquals(
      f.getPermissions.calls,
      List(sessionUser)
    )
    assertEquals(f.db.run.times, 2)
  }

  test("a session cookie reads the moderation log with the modifier named") {
    val f        = new Fixture
    val response = runRoute(f.api(), withSession(Get("/permissions/log"), f))

    assertEquals(response.status, StatusCodes.OK)
    val body = bodyOf(response)
    assert(body.contains("real-modifier"))
    assertEquals(f.db.getPermissionModerationLog.times, 1)
    assertEquals(f.getPermissions.calls, List(sessionUser))
    assertEquals(f.db.run.times, 2)
  }
}
