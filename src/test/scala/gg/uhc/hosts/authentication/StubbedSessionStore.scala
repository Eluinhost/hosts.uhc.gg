package gg.uhc.hosts.authentication

import gg.uhc.hosts.database.LiveSession
import org.scalamock.stubs.{Stub, Stubs}

import java.net.InetAddress
import java.time.{Duration, Instant}
import scala.collection.mutable
import scala.concurrent.Future

class StubbedSessionStore(val store: Stub[SessionStore]) extends Stubs {
  private val absoluteTimeout = Duration.ofDays(90)
  private val rows            = mutable.Map.empty[String, LiveSession]

  store.lookup.returns { (id: String) => Future.successful(rows.get(id)) }

  store.touch.returns { (id: String) =>
    rows.get(id).foreach(row => rows.put(id, row.copy(lastSeen = Instant.now())))
    Future.successful(())
  }

  store.rotate.returns { case (id: String, newId: String) =>
    rows.remove(id).foreach { row =>
      rows.put(newId, row.copy(id = newId, lastSeen = Instant.now(), lastRotated = Instant.now()))
    }
    Future.successful(())
  }

  store.delete.returns { (id: String) =>
    rows.remove(id)
    Future.successful(())
  }

  store.logAccess.returns { case (username: String, ip: Option[InetAddress]) => Future.successful(()) }

  def add(username: String, permissions: List[String] = Nil, lastSeen: Instant = Instant.now()): String = {
    val id = SessionId.generate()
    rows.put(id, row(id, username, permissions, lastSeen))
    id
  }

  def entry(id: String): Option[LiveSession] = rows.get(id)

  def setPermissions(id: String, permissions: List[String]): Unit =
    rows.get(id).foreach(r => rows.put(id, r.copy(permissions = permissions)))

  def ageLastSeen(id: String, days: Long): Unit =
    rows.get(id).foreach(r => rows.put(id, r.copy(lastSeen = r.lastSeen.minus(Duration.ofDays(days)))))

  def ageLastRotated(id: String, days: Long): Unit =
    rows.get(id).foreach(r => rows.put(id, r.copy(lastRotated = r.lastRotated.minus(Duration.ofDays(days)))))

  def setAbsoluteExpiry(id: String, expiry: Instant): Unit =
    rows.get(id).foreach(r => rows.put(id, r.copy(absoluteExpiry = expiry)))

  def expire(id: String): Unit = {
    rows.remove(id)
    ()
  }

  private def row(id: String, username: String, permissions: List[String], lastSeen: Instant) =
    LiveSession(id, username, permissions, lastSeen, lastSeen, lastSeen.plus(absoluteTimeout))
}
