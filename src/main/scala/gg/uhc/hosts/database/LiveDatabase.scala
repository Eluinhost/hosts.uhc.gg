package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant
import java.util.UUID

import scala.concurrent.{ExecutionContext, Future}

import org.apache.pekko.actor.ActorSystem
import cats.data.NonEmptyList
import cats.effect.IO
import com.softwaremill.tagging.@@
import doobie.*
import doobie.free.connection.{delay, raw}
import doobie.implicits.*
import doobie.postgres.*
import doobie.postgres.implicits.*
import doobie.util.log.{ExecFailure, ProcessingFailure, Success}
import gg.uhc.hosts.{ConfigurationModule, DatabaseSystem, Instrumented}
import gg.uhc.hosts.authentication.SessionId

class LiveDatabase(transactor: Transactor[IO], system: ActorSystem @@ DatabaseSystem)
    extends Database
    with Instrumented
    with ConfigurationModule {
  private val queryTimer   = metrics.timer("query-time")
  private val successGauge = metrics.counter("successful-queries")
  private val failureGauge = metrics.counter("failed-queries")

  implicit val s: ActorSystem       = system
  override def ec: ExecutionContext = system.dispatcher

  val queries = new Queries(LogHandler {
    case Success(s, a, e1, e2) =>
      system.log.info(s"""Successful Statement Execution:
        |
        |  ${s.linesIterator.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec + ${e2.toMillis} ms processing (${(e1 + e2).toMillis} ms total)
        """.stripMargin)

    case ProcessingFailure(s, a, e1, e2, t) =>
      system.log.error(
        t,
        s"""Failed Resultset Processing:
        |
        |  ${s.linesIterator.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec + ${e2.toMillis} ms processing (failed) (${(e1 + e2).toMillis} ms total)
        |   failure = ${t.getMessage}
        """.stripMargin
      )

    case ExecFailure(s, a, e1, t) =>
      system.log.error(
        t,
        s"""Failed Statement Execution:
        |
        |  ${s.linesIterator.dropWhile(_.trim.isEmpty).mkString("\n  ")}
        |
        | arguments = [${a.mkString(", ")}]
        |   elapsed = ${e1.toMillis} ms exec (failed)
        |   failure = ${t.getMessage}
        """.stripMargin
      )
  })

  override def getUpcomingMatches: ConnectionIO[List[MatchRow]] = queries.getUpcomingMatches.to[List]

  override def matchById(id: Long): ConnectionIO[Option[MatchRow]] = queries.matchById(id).option

  override def getMatchesByIds(ids: List[Long]): ConnectionIO[List[MatchRow]] =
    ids match {
      // if at least one item in IDs run the query
      case a +: as => queries.getMatchesByIds(NonEmptyList(a, as)).to[List]
      // otherwise don't run anything and use an empty list instead
      case _       => delay(List.empty[MatchRow])
    }

  override def insertMatch(m: MatchRow): ConnectionIO[Long] =
    queries.insertMatch(m).withUniqueGeneratedKeys[Long]("id")

  override def removeMatch(id: Long, reason: String, remover: String): ConnectionIO[Int] =
    queries.removeMatch(id, reason, remover).run

  override def isOwnerOfMatch(id: Long, username: String): ConnectionIO[Boolean] =
    queries.isOwnerOfMatch(id, username).unique

  override def getUserCountForEachPermission(): ConnectionIO[Map[String, Int]] =
    queries.getUserCountForEachPermission.to[List].map(_.toMap)

  override def getAllUsersForPermission(permission: String, count: Int): ConnectionIO[List[String]] =
    queries.getAllUsersForPermission(permission, count).to[List]

  override def getUserCountForPermissionByFirstLetter(permission: String): ConnectionIO[Map[String, Int]] =
    queries.getUserCountForPermissionByFirstLetter(permission).to[List].map(_.toMap)

  override def getUsersForPermissionStartingWithLetter(permission: String, letter: String): ConnectionIO[List[String]] =
    queries.getUsersForPermissionStartingWithLetter(permission, letter).to[List]

  override def getPermissions(username: String): ConnectionIO[List[String]] =
    queries.getPermissions(username).to[List]

  override def getPermissions(usernames: List[String]): ConnectionIO[Map[String, List[String]]] = usernames match {
    // if at least one item run the query
    case a +: as =>
      queries.getPermissions(NonEmptyList(a, as)).to[List].map { response =>
        response.map(permissionSet => permissionSet.username -> permissionSet.permissions).toMap
      }
    // otherwise don't run anything and use an empty map instead
    case _       => raw(_ => Map.empty[String, List[String]])
  }

  override def getRecentHostApplications: ConnectionIO[List[HostApplicationRow]] =
    queries.getRecentHostApplications.to[List]

  override def getHostApplication(id: Long): ConnectionIO[Option[HostApplicationRow]] =
    queries.getHostApplication(id).option

  override def getPendingHostApplicationForUsername(username: String): ConnectionIO[Option[HostApplicationRow]] =
    queries.getPendingHostApplicationForUsername(username).option

  override def reviewHostApplication(
      id: Long,
      status: String,
      reviewer: String,
      reason: Option[String]
  ): ConnectionIO[Boolean] =
    queries.reviewHostApplication(id, status, reviewer, reason).run.map(_ > 0)

  override def getHostApplicationAnswers(applicationId: Long): ConnectionIO[List[HostApplicationAnswerRow]] =
    queries.getHostApplicationAnswers(applicationId).to[List]

  override def submitHostApplication(username: String, answers: List[HostApplicationAnswerRow]): ConnectionIO[Long] =
    for {
      id <- queries.createHostApplication(username).withUniqueGeneratedKeys[Long]("id")
      _  <- answers.foldLeft(delay(())) { (acc, answer) =>
              acc.flatMap(_ => queries.createHostApplicationAnswer(id, answer).run.map(_ => ()))
            }
    } yield id

  override def getAllQuizQuestions: ConnectionIO[List[QuizQuestionRow]] =
    queries.getAllQuizQuestions.to[List]

  override def getQuizQuestionChoices(questionIds: List[Long]): ConnectionIO[List[QuizQuestionChoiceRow]] =
    questionIds match {
      case a +: as => queries.getQuizQuestionChoices(NonEmptyList(a, as)).to[List]
      case _       => delay(List.empty[QuizQuestionChoiceRow])
    }

  override def createQuizQuestionWithChoices(
      question: QuizQuestionRow,
      choices: List[(String, Boolean)]
  ): ConnectionIO[Long] =
    for {
      id <- queries.createQuizQuestion(question).withUniqueGeneratedKeys[Long]("id")
      _  <- choices.foldLeft(delay(())) { (acc, choice) =>
              acc.flatMap(_ => queries.createQuizQuestionChoice(id, choice._1, choice._2).run.map(_ => ()))
            }
    } yield id

  override def deleteQuizQuestion(id: Long): ConnectionIO[Int] =
    queries.deleteQuizQuestion(id).run

  override def addPermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      inserted <- queries.addPermission(username = username, permission = permission).run.map(_ > 0)
      _        <- if inserted then
        queries
          .addPermissionModerationLog(
            username = username,
            permission = permission,
            modifier = modifier,
            added = true
          )
          .run
      else raw(_ => ())
    } yield inserted

  override def removePermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      removed <- queries.removePermission(username = username, permission = permission).run.map(_ > 0)
      _       <- if removed then
        queries
          .addPermissionModerationLog(
            username = username,
            permission = permission,
            modifier = modifier,
            added = false
          )
          .run
      else raw(_ => ())
    } yield removed

  override def getPermissionModerationLog(
      before: Option[Int],
      count: Int
  ): ConnectionIO[List[PermissionModerationLogRow]] =
    queries.getPermissionModerationLog(before, count).to[List]

  override def updateAuthenticationLog(username: String, ip: InetAddress): ConnectionIO[Unit] =
    queries.updateAuthenticationLog(username, ip).run.map(_ => ())

  override def getPotentialConflicts(
      start: Instant,
      end: Instant,
      region: String,
      version: String
  ): ConnectionIO[List[MatchRow]] =
    queries.getPotentialConflicts(start, end, region, version).to[List]

  override def getUserApiKey(username: String): ConnectionIO[Option[String]] =
    queries.getUserApiKey(username).option

  override def regnerateApiKey(username: String): ConnectionIO[String] = {
    val key = (UUID.randomUUID().toString + UUID.randomUUID().toString + UUID.randomUUID().toString).replaceAll("-", "")

    queries.setUserApiKey(username, key).run.map(_ => key)
  }

  private lazy val sessionIdleTimeout     = config.getDuration("session.idleTimeout")
  private lazy val sessionAbsoluteTimeout = config.getDuration("session.absoluteTimeout")

  override def createSession(
      username: String,
      ip: Option[InetAddress],
      userAgent: Option[String]
  ): ConnectionIO[CreatedSession] = {
    val id             = SessionId.generate()
    val now            = Instant.now()
    val absoluteExpiry = now.plus(sessionAbsoluteTimeout)
    val idleExpiry     = now.plus(sessionIdleTimeout)

    queries
      .insertSession(id, username, ip, userAgent, absoluteExpiry)
      .run
      .map(_ => CreatedSession(id, if idleExpiry.isBefore(absoluteExpiry) then idleExpiry else absoluteExpiry))
  }

  override def fetchSession(id: String): ConnectionIO[Option[SessionRow]] =
    queries.getSession(id).option

  override def touchSession(id: String): ConnectionIO[Unit] =
    queries.touchSession(id).run.map(_ => ())

  override def rotateSession(id: String, newId: String): ConnectionIO[Unit] =
    queries.rotateSession(id, newId).run.map(_ => ())

  override def deleteSession(id: String): ConnectionIO[Unit] =
    queries.deleteSession(id).run.map(_ => ())

  override def purgeExpiredSessions(): ConnectionIO[Long] =
    queries.deleteExpiredSessions(sessionIdleTimeout.getSeconds).run.map(_.toLong)

  override def getLatestRules: ConnectionIO[RulesRow] =
    queries.getLatestRules.unique

  override def setRules(author: String, content: String): ConnectionIO[Unit] =
    queries.setRules(author, content).run.map(_ => ())

  override def approveMatch(id: Long, approver: String): ConnectionIO[Boolean] =
    queries.approveMatch(id, approver).run.map(_ > 0)

  override def getHostingHistory(host: String, before: Option[Long], count: Int): ConnectionIO[List[MatchRow]] =
    queries.hostingHistory(host, before, count).to[List]

  override def run[T](query: ConnectionIO[T]): Future[T] =
    Future {
      queryTimer.time {
        query.transact(transactor).unsafeRunSync()
      }
    }(using ec).transform({ result =>
      if result.isSuccess then {
        successGauge.inc()
      } else {
        failureGauge.inc()
      }
      result
    })(using ec)

  override def getUnapprovedUpcomingMatchesCount: ConnectionIO[Int] = queries.unapprovedUpcomingMatchesCount.unique

  override def getAllModifiers(): ConnectionIO[List[ModifierRow]] =
    queries.getAllModifiers().to[List]

  override def createModifier(modifier: String): ConnectionIO[Int] =
    queries.createModifier(modifier).withUniqueGeneratedKeys[Int]("id")

  override def deleteModifier(id: Int): ConnectionIO[Boolean] =
    queries.deleteModifier(id).run.map(_ > 0)
}
