package gg.uhc.hosts.discord

import java.awt.Color

import akka.actor.ActorSystem
import gg.uhc.hosts.database.Database
import sx.blah.discord.api.events.IListener
import sx.blah.discord.handle.impl.events.guild.channel.message.MessageReceivedEvent

import scala.concurrent.ExecutionContext
import scala.util.Try

class ShowMatchCommand(database: Database)(implicit val as: ActorSystem) extends IListener[MessageReceivedEvent] {
  import DiscordHelpers._

  implicit val ec: ExecutionContext = as.dispatcher

  override def handle(event: MessageReceivedEvent): Unit = {
    if (!event.getMessage.getContent.startsWith("uhc!m"))
      return

    val parts = event.getMessage.getContent.split(" ")

    if (parts.length < 1)
      return

    val maybeId: Option[Int] = parts
      .drop(1) // drop !m
      .headOption
      .flatMap { numString ⇒
        Try { numString.toInt }.toOption
      }

    if (maybeId.isEmpty) {
      retryRequest {
        event.getChannel.sendMessage("Syntax: uhc!m <id>")
      }
      return
    }

    val futureRow = database.run(database.matchById(maybeId.get))

    futureRow.foreach { maybeRow ⇒
      maybeRow
        .map(_.baseEmbed.withColor(Color.GREEN).build())
        .map { embed ⇒
          retryRequest {
            event.getChannel.sendMessage(embed)
          }
        }
        .getOrElse {
          retryRequest {
            event.getChannel.sendMessage("Unknown match id")
          }
        }
    }

    futureRow.failed.map { _ ⇒
      retryRequest {
        event.getChannel.sendMessage("Failed to lookup match")
      }
    }
  }
}
