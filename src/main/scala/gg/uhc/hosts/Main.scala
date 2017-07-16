package gg.uhc.hosts

import com.softwaremill.macwire.wire
import gg.uhc.hosts.database.DatabaseModule
import gg.uhc.hosts.routes.RouteModule

trait MainModule extends DatabaseModule with RouteModule {
  lazy val startup: Startup = wire[Startup]
}

object Main extends App with MainModule {
  startup()
}
