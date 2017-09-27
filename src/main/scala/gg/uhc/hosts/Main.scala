package gg.uhc.hosts

import com.softwaremill.macwire.wire
import gg.uhc.hosts.database.DatabaseModule
import gg.uhc.hosts.endpoints.EndpointsModule
import gg.uhc.hosts.discord.DiscordModule

trait MainModule extends DatabaseModule with EndpointsModule with DiscordModule {
  lazy val startup: Startup = wire[Startup]
}

object Main extends App with MainModule {
  startup()
}
