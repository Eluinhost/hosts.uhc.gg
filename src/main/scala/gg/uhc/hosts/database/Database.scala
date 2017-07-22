package gg.uhc.hosts.database

import akka.actor.ActorSystem
import doobie.hikari.hikaritransactor.HikariTransactor
import doobie.imports._
import gg.uhc.hosts.database.Queries.MatchRow

import scala.concurrent.{ExecutionContext, Future}

class Database(transactor: HikariTransactor[IOLite]) {
  implicit val system               = ActorSystem("database")
  implicit val ec: ExecutionContext = system.dispatcher

  val logHandler: LogHandler = LogHandler.jdkLogHandler
  def listMatches: ConnectionIO[List[MatchRow]] =
    Queries.listMathes.list

  def insertMatch(m: MatchRow): ConnectionIO[Int] =
    Queries.insertMatch(m).run

  def removeMatch(id: Long, reason: String, remover: String): ConnectionIO[Int] =
    Queries.removeMatch(id, reason, remover).run

  def isOwnerOfMatch(id: Long, username: String): ConnectionIO[Boolean] =
    Queries.isOwnerOfMatch(id, username).unique

  def getPermissions(username: String): ConnectionIO[List[String]] =
    Queries.getPermissions(username).list

  def run[T](query: ConnectionIO[T]): Future[T] = Future {
    query.transact(transactor).unsafePerformIO
  }
}
