package gg.uhc.hosts.discord

import akka.actor.ActorSystem
import sx.blah.discord.api.events.IListener
import sx.blah.discord.api.internal.json.objects.EmbedObject
import sx.blah.discord.handle.impl.events.guild.channel.message.MessageReceivedEvent
import sx.blah.discord.util.EmbedBuilder

import scala.concurrent.ExecutionContext

class HelpCommand(implicit val as: ActorSystem) extends IListener[MessageReceivedEvent] {
  import DiscordHelpers._

  implicit val ec: ExecutionContext = as.dispatcher

  val helpEmbed: EmbedObject = new EmbedBuilder()
    .setLenient(true)
    .withTitle("uhc.gg help")
    .appendField("uhc!upcoming", "Show all games opening in the next 30 mins", false)
    .appendField("uhc!m <id>", "Show match with the given ID", false)
    .appendField("uhc!help", "This message", false)
    .build()

  override def handle(event: MessageReceivedEvent): Unit = {
    if (!event.getMessage.getContent.startsWith("uhc!help"))
      return

    retryRequest {
      event.getChannel.sendMessage(helpEmbed)
    }
  }
}
