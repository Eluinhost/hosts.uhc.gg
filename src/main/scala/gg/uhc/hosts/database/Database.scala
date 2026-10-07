package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant

import scala.concurrent.{ExecutionContext, Future}

import doobie.*

trait Database {
  def ec: ExecutionContext

  def getUpcomingMatches: ConnectionIO[List[MatchRow]]
  def matchById(id: Long): ConnectionIO[Option[MatchRow]]
  def getMatchesByIds(ids: List[Long]): ConnectionIO[List[MatchRow]]
  def insertMatch(m: MatchRow): ConnectionIO[Long]
  def removeMatch(id: Long, reason: String, remover: String): ConnectionIO[Int]
  def isOwnerOfMatch(id: Long, username: String): ConnectionIO[Boolean]
  def getUserCountForEachPermission(): ConnectionIO[Map[String, Int]]
  def getAllUsersForPermission(permission: String, count: Int): ConnectionIO[List[String]]
  def getUserCountForPermissionByFirstLetter(permission: String): ConnectionIO[Map[String, Int]]
  def getUsersForPermissionStartingWithLetter(permission: String, letter: String): ConnectionIO[List[String]]
  def getPermissions(username: String): ConnectionIO[List[String]]
  def getPermissions(usernames: List[String]): ConnectionIO[Map[String, List[String]]]
  def getRecentHostApplications: ConnectionIO[List[HostApplicationRow]]
  def getHostApplication(id: Long): ConnectionIO[Option[HostApplicationRow]]
  def getPendingHostApplicationForUsername(username: String): ConnectionIO[Option[HostApplicationRow]]
  def reviewHostApplication(id: Long, status: String, reviewer: String, reason: Option[String]): ConnectionIO[Boolean]
  def getHostApplicationAnswers(applicationId: Long): ConnectionIO[List[HostApplicationAnswerRow]]
  def submitHostApplication(username: String, answers: List[HostApplicationAnswerRow]): ConnectionIO[Long]
  def getAllQuizQuestions: ConnectionIO[List[QuizQuestionRow]]
  def getQuizQuestionChoices(questionIds: List[Long]): ConnectionIO[List[QuizQuestionChoiceRow]]
  def createQuizQuestionWithChoices(question: QuizQuestionRow, choices: List[(String, Boolean)]): ConnectionIO[Long]
  def deleteQuizQuestion(id: Long): ConnectionIO[Int]
  def addPermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean]
  def removePermission(username: String, permission: String, modifier: String): ConnectionIO[Boolean]
  def getPermissionModerationLog(before: Option[Int], count: Int): ConnectionIO[List[PermissionModerationLogRow]]
  def updateAuthenticationLog(username: String, ip: InetAddress): ConnectionIO[Unit]
  def getPotentialConflicts(
      start: Instant,
      end: Instant,
      region: String,
      version: String
  ): ConnectionIO[List[MatchRow]]
  def getUserApiKey(username: String): ConnectionIO[Option[String]]
  def regnerateApiKey(username: String): ConnectionIO[String]
  def createSession(
      username: String,
      ip: Option[InetAddress],
      userAgent: Option[String]
  ): ConnectionIO[CreatedSession]
  def fetchSession(id: String): ConnectionIO[Option[SessionRow]]
  def touchSession(id: String): ConnectionIO[Unit]
  def rotateSession(id: String, newId: String): ConnectionIO[Unit]
  def deleteSession(id: String): ConnectionIO[Unit]
  def purgeExpiredSessions(): ConnectionIO[Long]
  def getLatestRules: ConnectionIO[RulesRow]
  def setRules(author: String, content: String): ConnectionIO[Unit]
  def approveMatch(id: Long, approver: String): ConnectionIO[Boolean]
  def getHostingHistory(host: String, before: Option[Long], count: Int): ConnectionIO[List[MatchRow]]
  def run[T](query: ConnectionIO[T]): Future[T]
  def getUnapprovedUpcomingMatchesCount: ConnectionIO[Int]
  def getAllModifiers(): ConnectionIO[List[ModifierRow]]
  def createModifier(modifier: String): ConnectionIO[Int]
  def deleteModifier(id: Int): ConnectionIO[Boolean]
}
