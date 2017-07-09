package gg.uhc.hosts

import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.actor.ActorSystem
import akka.http.scaladsl.server.Directives.{onComplete, provide, reject}
import akka.http.scaladsl.server.{Directive1, Rejection}
import com.typesafe.config.ConfigFactory
import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import doobie.hikari.hikaritransactor.HikariTransactor
import org.flywaydb.core.Flyway
import doobie.imports._
import doobie.postgres.imports._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

object Database {
  private[this] val config = ConfigFactory.load()

  private[this] implicit val system               = ActorSystem("database")
  private[this] implicit val ec: ExecutionContext = system.dispatcher

  private[this] implicit val logHandler: LogHandler = LogHandler.jdkLogHandler

  private[this] val hikariConfig = new HikariConfig()

  hikariConfig.setJdbcUrl(config.getString("database.url"))
  hikariConfig.setUsername(config.getString("database.user"))
  hikariConfig.setPassword(config.getString("database.password"))

  private[this] val datasource = new HikariDataSource(hikariConfig)

  private[this] val transactor = HikariTransactor[IOLite](datasource)

  private[this] val flyway = new Flyway()
  flyway.setDataSource(datasource)
  flyway.migrate()

  def onShutdown(): Unit = {
    transactor.shutdown.unsafePerformIO
  }

  private[this] val listQuery: Query0[MatchRow] =
    sql"""
       SELECT
        id,
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        created
       FROM matches
       WHERE opens > ${Instant.now().minus(30, ChronoUnit.MINUTES)}
       ORDER BY opens ASC
    """.asInstanceOf[Fragment].query[MatchRow]

  private[this] def insertQuery(m: MatchRow): Update0 =
    sql"""
      INSERT INTO matches (
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        created
      ) VALUES (
        ${m.author},
        ${m.opens},
        ${m.address},
        ${m.ip},
        ${m.scenarios},
        ${m.tags},
        ${m.teams},
        ${m.size},
        ${m.customStyle},
        ${m.count},
        ${m.content},
        ${m.region},
        ${m.removed},
        ${m.removedBy},
        ${m.created}
      );""".asInstanceOf[Fragment].update

  private[this] def getPermissionsQuery(username: String): Query0[String] =
    sql"""
      SELECT
        type
      FROM
        permissions
      WHERE
        username = $username
     """.asInstanceOf[Fragment].query[String]

  def list: ConnectionIO[List[MatchRow]] = listQuery.list

  def insert(m: MatchRow): ConnectionIO[Int] = insertQuery(m).run

  def getPermissions(username: String): ConnectionIO[List[String]] =
    getPermissionsQuery(username).list

  case class DatabaseErrorRejection(cause: Throwable) extends Rejection

  def runDbQuery[T](query: ConnectionIO[T]): Future[T] = Future {
    query.transact(transactor).unsafePerformIO
  }

  def requireSucessfulQuery[T](query: ConnectionIO[T]): Directive1[T] = {
    onComplete(runDbQuery(query)) flatMap {
      case Success(value) ⇒ provide(value)
      case Failure(t)     ⇒ reject(DatabaseErrorRejection(t))
    }
  }
}
