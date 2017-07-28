package gg.uhc.hosts

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.stream.ActorMaterializer
import com.typesafe.config.Config
import doobie.hikari.hikaritransactor.HikariTransactor
import doobie.imports.IOLite
import gg.uhc.hosts.routes.Routes
import org.flywaydb.core.Flyway

import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext}

class Startup(routes: Routes, flyway: Flyway, transactor: HikariTransactor[IOLite], config: Config) {
  def apply(): Unit = {
    flyway.migrate()

    sys.addShutdownHook {
      transactor.shutdown.unsafePerformIO
    }

    implicit val system               = ActorSystem("http-actor-system", config)
    implicit val ec: ExecutionContext = system.dispatcher
    implicit val materializer         = ActorMaterializer()

    Http()
      .bindAndHandle(
        handler = routes.all,
        interface = config.getString("http.interface"),
        port = config.getInt("http.port")
      )
      .foreach { binding ⇒
        system.log.info(s"Server started on ${binding.localAddress.toString}")

        sys.addShutdownHook {
          system.log.info("Shutting down")

          Await.ready(
            for {
              _ ← binding.unbind()
              _ = system.log.info("Unbound server")
              t ← system.terminate()
              _ = system.log.info("Shut down actor system")
            } yield t,
            1.minute
          )
        }
      }
  }
}
