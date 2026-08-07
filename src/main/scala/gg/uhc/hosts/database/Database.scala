package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant
import java.util.UUID

import org.apache.pekko.actor.ActorSystem
import cats.data.NonEmptyList
import cats.effect.IO
import com.softwaremill.tagging.@@
import doobie.free.connection.{delay, raw}
import doobie._
import doobie.implicits._
import doobie.postgres._
import doobie.postgres.implicits._
import doobie.util.log.{ExecFailure, ProcessingFailure, Success}
import gg.uhc.hosts.{DatabaseSystem, Instrumented}

import scala.concurrent.{ExecutionContext, Future}

class Database(transactor: Transactor[IO], system: ActorSystem @@ DatabaseSystem) extends Instrumented {
  private[this] val queryTimer   = metrics.timer("query-time")
  private[this] val successGauge = metrics.counter("successful-queries")
  private[this] val failureGauge = metrics.counter("failed-queries")

  implicit val s: ActorSystem  = system
  implicit val ec: ExecutionContext = system.dispatcher

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

  def getUpcomingMatches: ConnectionIO[List[MatchRow]] = queries.getUpcomingMatches.to[List]

  def matchById(id: Long): ConnectionIO[Option[MatchRow]] = queries.matchById(id).option

  def getMatchesByIds(ids: List[Long]): ConnectionIO[List[MatchRow]] =
    ids match {
      // if at least one item in IDs run the query
      case a +: as => queries.getMatchesByIds(NonEmptyList(a, as)).to[List]
      // otherwise don't run anything and use an empty list instead
      case _ => delay(List.empty[MatchRow])
    }

  def insertMatch(m: MatchRow): ConnectionIO[Long] =
    queries.insertMatch(m).withUniqueGeneratedKeys[Long]("id")

  def removeMatch(id: Long, reason: String, remover: String): ConnectionIO[Int] =
    queries.removeMatch(id, reason, remover).run

  def isOwnerOfMatch(id: Long, username: String): ConnectionIO[Boolean] =
    queries.isOwnerOfMatch(id, username).unique

  def getUnprocessedDiscordMatches(): ConnectionIO[List[MatchRow]] =
    queries.getUnprocessedDiscordMatches.to[List]

  def flagMatchesAsProcessedForDiscord(ids: List[Long]): ConnectionIO[Unit] = ids match {
    // if at least one item in IDs run the query
    case a +: as => queries.flagMatchesAsProcessedForDiscord(NonEmptyList(a, as)).run.map(_ => ())
    // otherwise don't run anything and use an empty list instead
    case _ => delay(())
  }

  def getUserCountForEachPermission(): ConnectionIO[Map[String, Int]] =
    queries.getUserCountForEachPermission.to[List].map(_.toMap)

  def getAllUsersForPermission(permission: String, count: Int): ConnectionIO[List[String]] =
    queries.getAllUsersForPermission(permission, count).to[List]

  def getUserCountForPermissionByFirstLetter(permission: String): ConnectionIO[Map[String, Int]] =
    queries.getUserCountForPermissionByFirstLetter(permission).to[List].map(_.toMap)

  def getUsersForPermissionStartingWithLetter(permission: String, letter: String): ConnectionIO[List[String]] =
    queries.getUsersForPermissionStartingWithLetter(permission, letter).to[List]

  def getPermissions(username: String): ConnectionIO[List[String]] =
    queries.getPermissions(username).to[List]

  def getPermissions(usernames: List[String]): ConnectionIO[Map[String, List[String]]] = usernames match {
    // if at least one item run the query
    case a +: as =>
      queries.getPermissions(NonEmptyList(a, as)).to[List].map { response =>
        response.map(permissionSet => permissionSet.username -> permissionSet.permissions).toMap
      }
    // otherwise don't run anything and use an empty map instead
    case _ => raw(_ => Map.empty[String, List[String]])
  }

  def getRecentHostApplications: ConnectionIO[List[HostApplicationRow]] =
    queries.getRecentHostApplications.to[List]

  def getHostApplication(id: Long): ConnectionIO[Option[HostApplicationRow]] =
    queries.getHostApplication(id).option

  def getPendingHostApplicationForUsername(username: String): ConnectionIO[Option[HostApplicationRow]] =
    queries.getPendingHostApplicationForUsername(username).option

  def reviewHostApplication(id: Long, status: String, reviewer: String, reason: Option[String]): ConnectionIO[Boolean] =
    queries.reviewHostApplication(id, status, reviewer, reason).run.map(_ > 0)

  def getHostApplicationAnswers(applicationId: Long): ConnectionIO[List[HostApplicationAnswerRow]] =
    queries.getHostApplicationAnswers(applicationId).to[List]

  def submitHostApplication(username: String, answers: List[HostApplicationAnswerRow]): ConnectionIO[Long] =
    for {
      id <- queries.createHostApplication(username).withUniqueGeneratedKeys[Long]("id")
      _ <- answers.foldLeft(delay(())) { (acc, answer) =>
        acc.flatMap(_ => queries.createHostApplicationAnswer(id, answer).run.map(_ => ()))
      }
    } yield id

  def getAllQuizQuestions: ConnectionIO[List[QuizQuestionRow]] =
    queries.getAllQuizQuestions.to[List]

  def getQuizQuestionChoices(questionIds: List[Long]): ConnectionIO[List[QuizQuestionChoiceRow]] =
    questionIds match {
      case a +: as => queries.getQuizQuestionChoices(NonEmptyList(a, as)).to[List]
      case _       => delay(List.empty[QuizQuestionChoiceRow])
    }

  def createQuizQuestionWithChoices(question: QuizQuestionRow, choices: List[(String, Boolean)]): ConnectionIO[Long] =
    for {
      id <- queries.createQuizQuestion(question).withUniqueGeneratedKeys[Long]("id")
      _ <- choices.foldLeft(delay(())) { (acc, choice) =>
        acc.flatMap(_ => queries.createQuizQuestionChoice(id, choice._1, choice._2).run.map(_ => ()))
      }
    } yield id

  def deleteQuizQuestion(id: Long): ConnectionIO[Int] =
    queries.deleteQuizQuestion(id).run

  def addPermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      inserted <- queries.addPermission(username = username, permission = permission).run.map(_ > 0)
      _ <- if (inserted)
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

  def removePermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    for {
      removed <- queries.removePermission(username = username, permission = permission).run.map(_ > 0)
      _ <- if (removed)
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

  def getPermissionModerationLog(before: Option[Int], count: Int): ConnectionIO[List[PermissionModerationLogRow]] =
    queries.getPermissionModerationLog(before, count).to[List]

  def updateAuthenticationLog(username: String, ip: InetAddress): ConnectionIO[Unit] =
    queries.updateAuthenticationLog(username, ip).run.map(_ => ())

  def getPotentialConflicts(start: Instant, end: Instant, region: String, version: String): ConnectionIO[List[MatchRow]] =
    queries.getPotentialConflicts(start, end, region, version).to[List]

  def getUserApiKey(username: String): ConnectionIO[Option[String]] =
    queries.getUserApiKey(username).option

  def regnerateApiKey(username: String): ConnectionIO[String] = {
    val key =
      (UUID.randomUUID().toString + UUID.randomUUID().toString + UUID.randomUUID().toString).replaceAll("-", "")

    queries.setUserApiKey(username, key).run.map(_ => key)
  }

  def getLatestRules: ConnectionIO[RulesRow] =
    queries.getLatestRules.unique

  def setRules(author: String, content: String): ConnectionIO[Unit] =
    queries.setRules(author, content).run.map(_ => ())

  def approveMatch(id: Long, approver: String): ConnectionIO[Boolean] =
    queries.approveMatch(id, approver).run.map(_ > 0)

  def getCurrentUbl: ConnectionIO[List[UblRow]] =
    queries.getCurrentUbl.to[List]

  def getHostingHistory(host: String, before: Option[Long], count: Int): ConnectionIO[List[MatchRow]] =
    queries.hostingHistory(host, before, count).to[List]

  def createUblEntry(entry: UblRow): ConnectionIO[Long] =
    queries.createUblEntry(entry).withUniqueGeneratedKeys[Long]("id")

  def getUblEntriesForUuid(uuid: UUID): ConnectionIO[List[UblRow]] =
    queries.getUblEntriesForUuid(uuid).to[List]

  def searchUblUsername(username: String): ConnectionIO[Map[String, List[UUID]]] =
    queries.searchUblUsername(username).to[List].map(_.toMap)

  def editUblEntry(row: UblRow): ConnectionIO[Boolean] =
    queries.editUblEntry(row).run.map(_ > 0)

  def deleteUblEntry(id: Long): ConnectionIO[Boolean] =
    queries.deleteUblEntry(id).run.map(_ > 0)

  def getUblEntry(id: Long): ConnectionIO[Option[UblRow]] =
    queries.getUblEntry(id).option

  def run[T](query: ConnectionIO[T]): Future[T] =
    Future {
      queryTimer.time {
        query.transact(transactor).unsafeRunSync()
      }
    }.transform { result =>
      if (result.isSuccess) {
        successGauge.inc()
      } else {
        failureGauge.inc()
      }
      result
    }

  def getUnapprovedUpcomingMatchesCount: ConnectionIO[Int] = queries.unapprovedUpcomingMatchesCount.unique

  def createAlertRule(rule: AlertRuleRow): ConnectionIO[Long] =
    queries.createAlertRule(rule).withUniqueGeneratedKeys[Long]("id")

  def getAllAlertRules(): ConnectionIO[List[AlertRuleRow]] =
    queries.getAllAlertRules.to[List]

  def deleteAlertRule(id: Long): ConnectionIO[Int] =
    queries.deleteAlertRule(id).run

  def createAlert(matchId: Long, triggeredRuleId: Long): ConnectionIO[Int] =
    queries.createAlert(matchId, triggeredRuleId).run

  def getAlertsForDiscord(): ConnectionIO[List[AlertRow]] =
    queries.getAlertsForDiscord.to[List]

  def setAlertsHandledForDiscord(matchId: Long): ConnectionIO[Int] =
    queries.setAlertsHandledForDiscord(matchId).run

  def getAllModifiers(): ConnectionIO[List[ModifierRow]] =
    queries.getAllModifiers().to[List]

  def createModifier(modifier: String): ConnectionIO[Int] =
    queries.createModifier(modifier).withUniqueGeneratedKeys[Int]("id")

  def deleteModifier(id: Int): ConnectionIO[Boolean] =
    queries.deleteModifier(id).run.map(_ > 0)
}
