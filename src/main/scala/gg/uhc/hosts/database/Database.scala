package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant
import java.util.UUID

import akka.actor.ActorSystem
import doobie.free.connection.raw
import doobie.hikari.hikaritransactor.HikariTransactor
import doobie.imports._
import doobie.util.log.{ExecFailure, ProcessingFailure, Success}

import scala.concurrent.{ExecutionContext, Future}
import scalaz.NonEmptyList

class Database(transactor: HikariTransactor[IOLite]) {
  implicit val system               = ActorSystem("database")
  implicit val ec: ExecutionContext = system.dispatcher

  val queries = new Queries(LogHandler {
    case Success(s, a, e1, e2) =>
      system.log.info(s"""Successful Statement Execution:
        |
        |  ${s.lines.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec + ${e2.toMillis} ms processing (${(e1 + e2).toMillis} ms total)
        """.stripMargin)

    case ProcessingFailure(s, a, e1, e2, t) =>
      system.log.error(t, s"""Failed Resultset Processing:
        |
        |  ${s.lines.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec + ${e2.toMillis} ms processing (failed) (${(e1 + e2).toMillis} ms total)
        |   failure = ${t.getMessage}
        """.stripMargin)

    case ExecFailure(s, a, e1, t) =>
      system.log.error(t, s"""Failed Statement Execution:
        |
        |  ${s.lines.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec (failed)
        |   failure = ${t.getMessage}
        """.stripMargin)
  })

  def listMatches: ConnectionIO[List[MatchRow]] =
    queries.listMathes.list

  def matchById(id: Int): ConnectionIO[Option[MatchRow]] =
    queries.matchById(id).option

  def insertMatch(m: MatchRow): ConnectionIO[Int] =
    queries.insertMatch(m).run

  def removeMatch(id: Long, reason: String, remover: String): ConnectionIO[Int] =
    queries.removeMatch(id, reason, remover).run

  def isOwnerOfMatch(id: Long, username: String): ConnectionIO[Boolean] =
    queries.isOwnerOfMatch(id, username).unique

  def getPermissions(username: String): ConnectionIO[List[String]] =
    queries.getPermissions(username).list

  def getPermissions(usernames: Seq[String]): ConnectionIO[Map[String, List[String]]] = usernames match {
    // if at least one item run the query
    case a +: as ⇒
      queries.getPermissions(NonEmptyList(a, as: _*)).list.map { response ⇒
        response.map(permissionSet ⇒ permissionSet.username → permissionSet.permissions).toMap
      }
    // otherwise don't run anything and use an empty map instead
    case _ ⇒ raw(_ ⇒ Map.empty[String, List[String]])
  }

  def addPermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      inserted ← queries.addPermission(username = username, permission = permission).run.map(_ > 0)
      _ ← if (inserted)
        queries
          .addPermissionModerationLog(
            username = username,
            permission = permission,
            modifier = modifier,
            added = true
          )
          .run
      else raw(_ ⇒ Unit)
    } yield inserted

  def removePermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      removed ← queries.removePermission(username = username, permission = permission).run.map(_ > 0)
      _ ← if (removed)
        queries
          .addPermissionModerationLog(
            username = username,
            permission = permission,
            modifier = modifier,
            added = false
          )
          .run
      else raw(_ ⇒ Unit)
    } yield removed

  def getPermissionModerationLog(before: Option[Int], count: Int): ConnectionIO[List[PermissionModerationLogRow]] =
    queries.getPermissionModerationLog(before, count).list

  def getAllPermissions: ConnectionIO[Map[String, List[String]]] =
    queries.getAllRoleMembers.list.map(_.toMap)

  def updateAuthenticationLog(username: String, ip: InetAddress): ConnectionIO[Unit] =
    queries.updateAuthenticationLog(username, ip).run.map(_ ⇒ Unit)

  def getMatchesInDateRangeAndRegion(start: Instant, end: Instant, region: String): ConnectionIO[List[MatchRow]] =
    queries.getMatchesInDateRangeAndRegion(start, end, region).list

  def getUserApiKey(username: String): ConnectionIO[Option[String]] =
    queries.getUserApiKey(username).option

  def regnerateApiKey(username: String): ConnectionIO[String] = {
    val key = (UUID.randomUUID().toString + UUID.randomUUID().toString + UUID.randomUUID().toString).replaceAll("-", "")

    queries.setUserApiKey(username, key).run.map(_ ⇒ key)
  }

  def run[T](query: ConnectionIO[T]): Future[T] = Future {
    query.transact(transactor).unsafePerformIO
  }
}
