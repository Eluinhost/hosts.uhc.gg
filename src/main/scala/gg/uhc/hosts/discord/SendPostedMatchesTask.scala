package gg.uhc.hosts.discord

import java.awt.Color

import akka.actor.ActorSystem
import gg.uhc.hosts.database.Database
import sx.blah.discord.api.IDiscordClient
import sx.blah.discord.handle.obj.IChannel

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.FiniteDuration

class SendPostedMatchesTask(
    database: Database,
    client: IDiscordClient,
    channels: List[IChannel],
    flushDuration: FiniteDuration
  )(implicit as: ActorSystem)
    extends Runnable {
  import DiscordHelpers._

  implicit val ec: ExecutionContext = as.dispatcher

  override def run(): Unit =
    (for {
      unposted ← database.run(database.getUnprocessedDiscordMatches())
      _ = as.log.info(s"Found ${unposted.size} matches non-processed")
      _ ← unposted.foldLeft(Future.unit) { (prevFuture, row) ⇒
        for {
          _ ← prevFuture
          _ ← row.baseEmbed.withColor(Color.GREEN).build().sendToChannels(channels)
          _ ← database.run(database.flagMatchesAsProcessedForDiscord(List(row.id)))
        } yield Unit
      }
    } yield Unit)
      .map { _ ⇒
        as.log.info(s"Sent all, starting again in $flushDuration")
        as.scheduler.scheduleOnce(flushDuration, this)
      }
      .failed
      .map { t ⇒
        as.log.error(t, s"Failed to send some matches, starting again in $flushDuration")
        as.scheduler.scheduleOnce(flushDuration, this)
      }
}
