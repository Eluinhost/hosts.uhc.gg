package gg.uhc.hosts.authentication

import java.net.InetAddress
import java.time.Instant

import scala.concurrent.Future

import doobie.*
import doobie.free.connection.pure
import gg.uhc.hosts.database.{CreatedSession, Database, LiveSession}

class DatabaseSessionStore(database: Database, policy: SessionPolicy) extends SessionStore {

  override def create(username: String, ip: Option[InetAddress], userAgent: Option[String]): Future[CreatedSession] =
    database.run(database.createSession(username, ip, userAgent))

  override def lookup(id: String): Future[Option[LiveSession]] =
    database.run {
      database.fetchSession(id).flatMap {
        case None                                                                          => pure(Option.empty[LiveSession])
        case Some(row) if !policy.isValid(row.lastSeen, row.absoluteExpiry, Instant.now()) =>
          database.deleteSession(row.id).map(_ => Option.empty[LiveSession])
        case Some(row)                                                                     =>
          database.getPermissions(row.username).map { permissions =>
            Some(
              LiveSession(row.id, row.username, permissions, row.lastSeen, row.lastRotated, row.absoluteExpiry)
            )
          }
      }
    }

  override def touch(id: String): Future[Unit] = database.run(database.touchSession(id))

  override def rotate(id: String, newId: String): Future[Unit] = database.run(database.rotateSession(id, newId))

  override def delete(id: String): Future[Unit] = database.run(database.deleteSession(id))

  override def logAccess(username: String, ip: Option[InetAddress]): Future[Unit] =
    ip match {
      case Some(address) => database.run(database.updateAuthenticationLog(username, address))
      case None          => Future.successful(())
    }

  override def purgeExpired: Future[Long] = database.run(database.purgeExpiredSessions())
}
