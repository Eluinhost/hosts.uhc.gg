package gg.uhc.hosts.discord

import java.awt.Color
import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.actor.ActorSystem
import gg.uhc.hosts.database.Database
import sx.blah.discord.api.events.IListener
import sx.blah.discord.handle.impl.events.guild.channel.message.MessageReceivedEvent

import scala.concurrent.{ExecutionContext, Future}

class NextHalfHourMatchesCommand(database: Database)(implicit val as: ActorSystem) extends IListener[MessageReceivedEvent] {
  import DiscordHelpers._

  implicit val ec: ExecutionContext = as.dispatcher

  override def handle(event: MessageReceivedEvent): Unit = {
    if (!event.getMessage.getContent.startsWith("uhc!upcoming"))
      return

    val in30 = Instant.now().plus(30, ChronoUnit.MINUTES)

    database
      .run(database.getUpcomingMatches)
      .map {
        _.filter { m ⇒ !m.removed && m.opens.isBefore(in30) }.map { _.baseEmbed.withColor(Color.GREEN).build() }
      }
      .flatMap {
        case l if l.isEmpty ⇒
          retryRequest { event.getChannel.sendMessage("No matches in the next 30 minutes") }
        case l ⇒
          // send each message in series
          l.foldLeft(Future.unit) { (prevFuture, embed) ⇒
            prevFuture.flatMap { _ ⇒
              retryRequest {
                event.getChannel.sendMessage(embed)
              }
            }
          }
      }
      .failed
      .map { _ ⇒
        retryRequest {
          event.getChannel.sendMessage("Failed to lookup upcoming matches")
        }
      }
  }
}
