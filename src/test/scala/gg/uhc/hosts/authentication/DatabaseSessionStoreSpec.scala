package gg.uhc.hosts.authentication

import doobie.*
import doobie.free.connection.pure
import gg.uhc.hosts.PureAnswers
import gg.uhc.hosts.database.{CreatedSession, Database, LiveSession, SessionRow}
import munit.FunSuite
import org.scalamock.stubs.{StubbedMethod, Stubs}

import java.net.InetAddress
import java.time.{Duration, Instant}
import scala.concurrent.duration.*
import scala.concurrent.{Await, Future}

class DatabaseSessionStoreSpec extends FunSuite with Stubs {
  private val policy = SessionPolicy(Duration.ofDays(8), Duration.ofDays(90), Duration.ofDays(1))

  private val now = Instant.now()
  private val ip  = InetAddress.getByName("203.0.113.9")

  private def await[A](future: Future[A]): A = Await.result(future, 5.seconds)

  private class Fixture {
    val db      = stub[Database]
    val answers = new PureAnswers(db.run[Any])
    val store   = new DatabaseSessionStore(db, policy)

    val getPermissions: StubbedMethod[String, ConnectionIO[List[String]]] = db.getPermissions(_: String)
  }

  test("create stores the client details and returns whatever the db does") {
    val f       = new Fixture
    val created = CreatedSession("session-id", now.plus(Duration.ofDays(8)))
    f.db.createSession.returnsWith(pure(created))
    f.answers.install()

    val result = await(f.store.create("alice", Some(ip), Some("Firefox 140")))

    assertEquals(result, created)
    assertEquals(f.db.createSession.calls, List(("alice", Some(ip), Some("Firefox 140"))))
    assertEquals(f.db.run.times, 1)
  }

  test("create works with an unknown address and a missing user agent") {
    val f = new Fixture
    f.db.createSession.returnsWith(pure(CreatedSession("session-id", now)))
    f.answers.install()

    await(f.store.create("alice", None, None))

    assertEquals(f.db.createSession.calls, List(("alice", None, None)))
  }

  test("lookup returns the row with its permissions") {
    val f   = new Fixture
    val row = SessionRow(
      "session-id",
      "alice",
      now.minus(Duration.ofDays(1)),
      now,
      now.minus(Duration.ofDays(1)),
      now.plus(Duration.ofDays(80)),
      Some(ip),
      Some("Firefox 140")
    )
    f.db.fetchSession.returnsWith(pure(Some(row)))
    f.getPermissions.returnsWith(pure(List("host", "moderator")))
    f.answers.install()

    val session = await(f.store.lookup("session-id")).get

    val expected = LiveSession(
      "session-id",
      "alice",
      List("host", "moderator"),
      now,
      now.minus(Duration.ofDays(1)),
      now.plus(Duration.ofDays(80))
    )
    assertEquals(session, expected)
    assertEquals(f.db.fetchSession.calls, List("session-id"))
    assertEquals(f.getPermissions.calls, List("alice"))
    assertEquals(f.db.deleteSession.times, 0)
  }

  test("lookup of an unknown id returns nothing and deletes nothing") {
    val f = new Fixture
    f.db.fetchSession.returnsWith(pure(Option.empty[SessionRow]))
    f.answers.install()

    assertEquals(await(f.store.lookup("nope")), None)
    assertEquals(f.db.fetchSession.calls, List("nope"))
    assertEquals(f.db.deleteSession.times, 0)
    assertEquals(f.getPermissions.times, 0)
  }

  test("lookup of an expired session deletes the row and returns nothing") {
    val f       = new Fixture
    val expired = now.minus(Duration.ofDays(9))
    val row     =
      SessionRow("session-id", "alice", expired, expired, expired, now.plus(Duration.ofDays(80)), None, None)
    f.db.fetchSession.returnsWith(pure(Some(row)))
    f.db.deleteSession.returnsWith(pure(()))
    f.answers.install()

    assertEquals(await(f.store.lookup("session-id")), None)
    assertEquals(f.db.fetchSession.calls, List("session-id"))
    assertEquals(f.db.deleteSession.calls, List("session-id"))
    assertEquals(f.getPermissions.times, 0)
  }

  test("lookup past the absolute expiry deletes the row") {
    val f   = new Fixture
    val row = SessionRow("session-id", "alice", now, now, now, now.minusSeconds(1), None, None)
    f.db.fetchSession.returnsWith(pure(Some(row)))
    f.db.deleteSession.returnsWith(pure(()))
    f.answers.install()

    assertEquals(await(f.store.lookup("session-id")), None)
    assertEquals(f.db.fetchSession.calls, List("session-id"))
    assertEquals(f.db.deleteSession.calls, List("session-id"))
  }

  test("each of touch, rotate and delete run relevant queries") {
    val f = new Fixture
    f.db.touchSession.returnsWith(pure(()))
    f.db.rotateSession.returnsWith(pure(()))
    f.db.deleteSession.returnsWith(pure(()))
    f.answers.install()

    await(f.store.touch("old-id"))
    await(f.store.rotate("old-id", "new-id"))
    await(f.store.delete("new-id"))

    assertEquals(f.db.touchSession.calls, List("old-id"))
    assertEquals(f.db.rotateSession.calls, List(("old-id", "new-id")))
    assertEquals(f.db.deleteSession.calls, List("new-id"))
    assertEquals(f.db.run.times, 3)
  }

  test("logAccess with no address updates no rows") {
    val f = new Fixture
    f.answers.install()

    await(f.store.logAccess("alice", None))

    assertEquals(f.db.run.times, 0)
    assertEquals(f.db.updateAuthenticationLog.times, 0)
  }

  test("logAccess with an address writes to the authentication log") {
    val f = new Fixture
    f.db.updateAuthenticationLog.returnsWith(pure(()))
    f.answers.install()

    await(f.store.logAccess("alice", Some(ip)))

    assertEquals(f.db.updateAuthenticationLog.calls, List(("alice", ip)))
    assertEquals(f.db.run.times, 1)
  }

  test("purgeExpired runs the purge query and returns how many changed") {
    val f = new Fixture
    (() => f.db.purgeExpiredSessions()).returnsWith(pure(3L))
    f.answers.install()

    assertEquals(await(f.store.purgeExpired), 3L)
    assertEquals((() => f.db.purgeExpiredSessions()).times, 1)
  }
}
