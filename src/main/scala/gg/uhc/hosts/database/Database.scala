package gg.uhc.hosts.database

import akka.actor.ActorSystem
import doobie.free.connection.raw
import doobie.hikari.hikaritransactor.HikariTransactor
import doobie.imports._
import gg.uhc.hosts.database.Queries.MatchRow

import scala.concurrent.{ExecutionContext, Future}
import scalaz.NonEmptyList

class Database(transactor: HikariTransactor[IOLite]) {
  implicit val system               = ActorSystem("database")
  implicit val ec: ExecutionContext = system.dispatcher

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

  def getPermissions(usernames: Seq[String]): ConnectionIO[Map[String, List[String]]] = usernames match {
    // if at least one item run the query
    case a +: as ⇒ Queries.getPermissions(NonEmptyList(a, as: _*)).list.map { response ⇒
      response.map(permissionSet ⇒ permissionSet.username → permissionSet.permissions).toMap
    }
    // otherwise don't run anything and use an empty map instead
    case _ ⇒ raw(_ ⇒ Map.empty[String, List[String]])
  }

  def run[T](query: ConnectionIO[T]): Future[T] = Future {
    query.transact(transactor).unsafePerformIO
  }
}
