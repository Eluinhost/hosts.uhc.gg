package gg.uhc.hosts

import scala.concurrent.duration.*
import scala.util.{Failure, Success}

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.Http.ServerBinding
import cats.effect.*
import com.softwaremill.macwire.wire
import com.softwaremill.tagging.*
import com.typesafe.config.ConfigFactory
import doobie.hikari.HikariTransactor
import doobie.util.ExecutionContexts
import doobie.util.transactor.Transactor
import gg.uhc.hosts.database.{Database, LiveDatabase}
import gg.uhc.hosts.endpoints.EndpointsModule
import org.flywaydb.core.Flyway

class MainModule(
    transactor: Transactor[IO],
    val httpSystem: ActorSystem @@ HttpSystem,
    val databaseSystem: ActorSystem @@ DatabaseSystem,
    val redditApiSystem: ActorSystem @@ RedditApiSystem
) extends EndpointsModule {
  val database: Database = wire[LiveDatabase]
}

case class Resources(system: ActorSystem, transactor: Transactor[IO], binding: ServerBinding)

object Main extends IOApp {
  def makeActorSystem(name: String): Resource[IO, ActorSystem] =
    Resource.make(
      IO { ActorSystem(name) }
    )(system =>
      IO {
        system.log.info(s"Shutting down actor system '$name'...")
        system.terminate()
      }
    )

  override def run(args: List[String]): IO[ExitCode] = {
    val resources: Resource[IO, Resources] = for {
      config            <- Resource.eval(IO {
                             ConfigFactory.load()
                           })
      httpSystem        <- makeActorSystem("http-actor-system")
      databaseSystem    <- makeActorSystem("database")
      redditApiSystem   <- makeActorSystem("reddit-api")
      executionContexts <- ExecutionContexts.fixedThreadPool[IO](32)
      blocker           <- Blocker[IO]
      transactor        <- HikariTransactor.newHikariTransactor[IO](
                             "org.postgresql.Driver",
                             config.getString("database.url"),
                             config.getString("database.user"),
                             config.getString("database.password"),
                             executionContexts,
                             blocker
                           )
      _                 <- Resource.eval(IO {
                             httpSystem.log.info("Starting migrations...")

                             Flyway.configure().dataSource(transactor.kernel).table("schema_version").load().migrate()
                           })
      mainModule        <- Resource.eval(IO {
                             new MainModule(
                               transactor,
                               httpSystem.taggedWith[HttpSystem],
                               databaseSystem.taggedWith[DatabaseSystem],
                               redditApiSystem.taggedWith[RedditApiSystem]
                             )
                           })
      sweepInterval     <- Resource.eval(IO {
                             val interval =
                               FiniteDuration(config.getDuration("session.sweepInterval").toMillis, MILLISECONDS)

                             if interval.toMillis > 0 then interval
                             else
                               throw new IllegalArgumentException(
                                 s"session.sweepInterval must be positive, got '${config.getDuration("session.sweepInterval")}'"
                               )
                           })
      _                 <- Resource.make(
                             IO {
                               databaseSystem.scheduler.scheduleWithFixedDelay(sweepInterval, sweepInterval)(() =>
                                 try {
                                   mainModule.database.run(mainModule.database.purgeExpiredSessions()).onComplete {
                                     case Success(n) if n > 0 => databaseSystem.log.info(s"Purged $n expired sessions")
                                     case Success(_)          => ()
                                     case Failure(e)          => databaseSystem.log.error("Session sweep failed", e)
                                   }(using databaseSystem.dispatcher)
                                 } catch {
                                   case e: Throwable =>
                                     databaseSystem.log.error(e, "Scheduled session sweep threw; the schedule is preserved")
                                 }
                               )(using databaseSystem.dispatcher)
                             }
                           )(cancellable => IO { cancellable.cancel() })
      binding           <- Resource.make(
                             IO.fromFuture(IO {
                               implicit val ac: ActorSystem = httpSystem

                               httpSystem.log.info("Starting web server...")

                               Http()
                                 .newServerAt(
                                   interface = config.getString("http.interface"),
                                   port = config.getInt("http.port")
                                 )
                                 .bind(mainModule.baseRoute())
                             })
                           )(binding =>
                             IO.fromFuture {
                               IO {
                                 httpSystem.log.info("Shutting down web server...")
                                 binding.unbind()
                               }
                             } *> IO.unit
                           )
    } yield Resources(httpSystem, transactor, binding)

    resources.use { _ =>
      IO.never
    }
  }
}
