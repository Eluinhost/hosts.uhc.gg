package gg.uhc.hosts.discord

import java.util.concurrent.TimeUnit

import akka.actor.{ActorSystem, Scheduler}
import sx.blah.discord.util.{EmbedBuilder, RateLimitException}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.FiniteDuration
import akka.pattern.after
import gg.uhc.hosts.database.MatchRow
import sx.blah.discord.api.internal.json.objects.EmbedObject
import sx.blah.discord.handle.obj.IChannel

import scala.concurrent.duration._

object DiscordHelpers {
  // attempts up to 5 times and listens to rate limit restrictions
  def retryRequest[T](f: ⇒ T)(implicit as: ActorSystem): Future[T] =
    retryFuture(
      future = Future { f }(as.dispatcher),
      retries = 5,
      delayFn = {
        case r: RateLimitException ⇒
          as.log.debug(s"Hit rate limiter, delaying by ${r.getRetryDelay}ms")
          FiniteDuration(r.getRetryDelay, TimeUnit.MILLISECONDS)
        case t ⇒
          as.log.error(t, "Failed to run request, delaying 100ms")
          100 milliseconds
      },
    )(as.dispatcher, as.scheduler)

  implicit class MatchRowDiscordExtensions(row: MatchRow) {
    lazy val baseEmbed: EmbedBuilder =
      new EmbedBuilder()
        .setLenient(true)
        .withAuthorName(s"/u/${row.author}")
        .withAuthorUrl(s"https://reddit.com/u/${row.author}")
        .withTitle(row.legacyTitle())
        .withUrl(s"https://hosts.uhc.gg/m/${row.id}")
        .withThumbnail("https://hosts.uhc.gg/logo.png")
        .withFooterText("Created")
        .withTimestamp(row.created.toEpochMilli)
        .appendField("Is Tournament", row.tournament.toString, true)
        .appendField("IP", row.ip.orNull, true)
        .appendField("Address", row.address.orNull, true)
        .appendField("Location", row.location, true)
        .appendField("Version", row.version, true)
        .appendField("Size", s"${row.mapSize}x${row.mapSize}", true)
        .appendField("PVP @", s"${row.pvpEnabledAt}m", true)
        .appendField("Meetup @", s"${row.length}m", true)
        .appendField("Slots", row.slots.toString, true)
  }

  private[this] def retryFuture[T](
      future: ⇒ Future[T],
      retries: Int,
      delayFn: (Throwable) ⇒ FiniteDuration
    )(implicit ec: ExecutionContext,
      scheduler: Scheduler
    ): Future[T] =
    future.recoverWith {
      case t if retries > 0 ⇒
        after(delayFn(t), scheduler) {
          retryFuture(future, retries - 1, delayFn)
        }
    }

  implicit class EmbedObjectExtensions(o: EmbedObject)(implicit as: ActorSystem) {
    def sendToChannels(channels: Seq[IChannel]): Future[Unit] =
      channels.foldLeft(Future.unit) { (prevFuture, channel) ⇒
        prevFuture.flatMap { _ ⇒
          retryRequest {
            channel.sendMessage(o)
            ()
          }
        }(as.dispatcher)
      }
  }
}
