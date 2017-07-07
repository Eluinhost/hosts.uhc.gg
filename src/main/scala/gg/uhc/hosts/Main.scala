package gg.uhc.hosts

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives
import akka.stream.ActorMaterializer
import com.typesafe.config.ConfigFactory
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext}
import scala.language.postfixOps

object Main extends App with Directives {
  val config = ConfigFactory.load()

  implicit val system               = ActorSystem("http-actor-system", config)
  implicit val ec: ExecutionContext = system.dispatcher
  implicit val materializer         = ActorMaterializer()

  sys.addShutdownHook(Database.onShutdown())

  Http()
    .bindAndHandle(
      handler = Routes.all,
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
          1 minute
        )
      }
    }
}
