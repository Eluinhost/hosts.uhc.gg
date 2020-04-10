package gg.uhc.hosts

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.Http.ServerBinding
import akka.stream.Materializer
import cats.effect._
import cats.implicits._
import com.softwaremill.macwire.wire
import com.softwaremill.tagging._
import com.typesafe.config.ConfigFactory
import doobie.hikari.HikariTransactor
import doobie.util.ExecutionContexts
import doobie.util.transactor.Transactor
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.EndpointsModule
import org.flywaydb.core.Flyway

import scala.io.StdIn

class MainModule(
    transactor: Transactor[IO],
    val materializer: Materializer,
    val databaseSystem: ActorSystem @@ DatabaseSystem,
    val redditApiSystem: ActorSystem @@ RedditApiSystem)
    extends EndpointsModule {
  val database: Database = wire[Database]
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
    })

  override def run(args: List[String]): IO[ExitCode] = {
    val resources: Resource[IO, Resources] = for {
      config <- Resource.liftF(IO {
        ConfigFactory.load()
      })
      httpSystem        <- makeActorSystem("http-actor-system")
      databaseSystem    <- makeActorSystem("database")
      redditApiSystem   <- makeActorSystem("reddit-api")
      executionContexts <- ExecutionContexts.fixedThreadPool[IO](32)
      blocker           <- Blocker[IO]
      transactor <- HikariTransactor.newHikariTransactor[IO](
        "org.postgresql.Driver",
        config.getString("database.url"),
        config.getString("database.user"),
        config.getString("database.password"),
        executionContexts,
        blocker
      )
      _ <- Resource.liftF(IO {
        httpSystem.log.info("Starting migrations...")

        val flyway = new Flyway()
        flyway.setDataSource(transactor.kernel)
        flyway.migrate()
      })
      binding <- Resource.make(
        IO.fromFuture(IO {
          implicit val ac: ActorSystem  = httpSystem
          implicit val mz: Materializer = Materializer.matFromSystem

          val mainModule = new MainModule(transactor,
                                          mz,
                                          databaseSystem.taggedWith[DatabaseSystem],
                                          redditApiSystem.taggedWith[RedditApiSystem])

          httpSystem.log.info("Starting web server...")

          Http().bindAndHandle(
            handler = mainModule.baseRoute(),
            interface = config.getString("http.interface"),
            port = config.getInt("http.port")
          )
        })
      )(binding =>
        IO.fromFuture {
          IO {
            httpSystem.log.info("Shutting down web server...")
            binding.unbind()
          }
        } *> IO.unit)
    } yield Resources(httpSystem, transactor, binding)

    resources.use { _ =>
      IO(StdIn.readLine) *> IO.pure(ExitCode.Success)
    }
  }
}
