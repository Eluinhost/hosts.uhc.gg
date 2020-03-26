package gg.uhc.hosts

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.Http.ServerBinding
import akka.stream.Materializer
import cats.effect._
import com.softwaremill.macwire.wire
import com.typesafe.config.ConfigFactory
import doobie.hikari.HikariTransactor
import doobie.util.ExecutionContexts
import doobie.util.transactor.Transactor
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.EndpointsModule
import org.flywaydb.core.Flyway

class MainModule(transactor: Transactor[IO], val materializer: Materializer) extends EndpointsModule {
  val database: Database = wire[Database]
}

case class Resources(system: ActorSystem, transactor: Transactor[IO], binding: ServerBinding)

object Main extends IOApp {
  val resources: Resource[IO, Resources] = for {
    config <- Resource.liftF(IO { ConfigFactory.load() })
    system <- Resource.make(
      IO { ActorSystem("http-actor-system", config) }
    )(system =>
      IO { system.terminate() }
    )
    executionContexts <- ExecutionContexts.fixedThreadPool[IO](32)
    blocker <- Blocker[IO]
    transactor <- HikariTransactor.newHikariTransactor[IO](
      "org.postgresql.Driver",
      config.getString("database.url"),
      config.getString("database.user"),
      config.getString("database.password"),
      executionContexts,
      blocker
    )
    _ <- Resource.liftF(IO {
      val flyway = new Flyway()
      flyway.setDataSource(transactor.kernel)
      flyway.migrate()
    })
    binding <- Resource.make(
      IO.fromFuture(IO {
        implicit val ac: ActorSystem = system
        implicit val mz: Materializer = Materializer.matFromSystem

        val mainModule = new MainModule(transactor, mz)

        Http().bindAndHandle(
          handler = mainModule.baseRoute(),
          interface = config.getString("http.interface"),
          port = config.getInt("http.port")
        )
      })
    )( binding =>
      IO { binding.unbind()
    })
  } yield Resources(system, transactor, binding)

  override def run(args: List[String]): IO[ExitCode] =
    resources.use { _ => IO.never }
}

