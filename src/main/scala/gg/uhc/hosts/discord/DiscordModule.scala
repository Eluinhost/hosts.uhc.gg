package gg.uhc.hosts.discord

import java.util.concurrent.TimeUnit

import akka.actor.ActorSystem
import gg.uhc.hosts.ConfigurationModule
import gg.uhc.hosts.database.DatabaseModule
import sx.blah.discord.api.{ClientBuilder, IDiscordClient}
import com.softwaremill.macwire.wire
import sx.blah.discord.api.events.IListener
import sx.blah.discord.handle.impl.events.ReadyEvent

import scala.collection.JavaConverters
import scala.concurrent.ExecutionContext
import scala.concurrent.duration.{Duration, FiniteDuration}

trait DiscordModule extends ConfigurationModule with DatabaseModule {
  private[this] implicit val discordAs: ActorSystem      = ActorSystem("discord")
  private[this] implicit val discordEc: ExecutionContext = discordAs.dispatcher

  val discordClient: IDiscordClient = new ClientBuilder()
    .withToken(config.getString("discord.token"))
    .build()

  if (!config.getBoolean("discord.disable")) {
    val helpCommand: HelpCommand                        = wire[HelpCommand]
    val showMatchCommand: ShowMatchCommand              = wire[ShowMatchCommand]
    val nextHalfHourMatches: NextHalfHourMatchesCommand = wire[NextHalfHourMatchesCommand]
    val nowPlayingTask: NowPlayingTask                  = wire[NowPlayingTask]

    discordClient.getDispatcher.registerListener(helpCommand)
    discordClient.getDispatcher.registerListener(showMatchCommand)
    discordClient.getDispatcher.registerListener(nextHalfHourMatches)
    discordClient.getDispatcher.registerTemporaryListener(new IListener[ReadyEvent] {
      override def handle(event: ReadyEvent): Unit = {
        discordAs.log.info("Discord ready, starting post checker...")

        val alertChannels = JavaConverters
          .iterableAsScalaIterable(config.getObjectList("discord.alerts channels"))
          .map(_.toConfig)
          .map { section ⇒
            event.getClient.getGuildByID(section.getLong("guild id")).getChannelByID(section.getLong("channel id"))
          }
          .toList

        val postedChannels =
          JavaConverters
            .iterableAsScalaIterable(config.getObjectList("discord.posted channels"))
            .map(_.toConfig)
            .map { section ⇒
              event.getClient.getGuildByID(section.getLong("guild id")).getChannelByID(section.getLong("channel id"))
            }
            .toList

        // Start tasks
        discordAs.scheduler.scheduleOnce(FiniteDuration(0, TimeUnit.MILLISECONDS), nowPlayingTask)
        discordAs.scheduler.scheduleOnce(
          FiniteDuration(0, TimeUnit.MILLISECONDS),
          new SendPostedMatchesTask(
            client = discordClient,
            database = database,
            channels = postedChannels,
            flushDuration = Duration(config.getString("discord.flush timer")).asInstanceOf[FiniteDuration]
          )
        )
        discordAs.scheduler.scheduleOnce(
          FiniteDuration(0, TimeUnit.MICROSECONDS),
          new SendWaitingAlertsTask(
            client = discordClient,
            database = database,
            channels = alertChannels,
            flushDuration = Duration(config.getString("discord.flush timer")).asInstanceOf[FiniteDuration]
          )
        )
      }
    })

    // start login, will trigger ReadyEvent listener and trigger loop of scheduling
    discordClient.login()
  }
}
