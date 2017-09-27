package gg.uhc.hosts.discord

import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.actor.ActorSystem
import doobie.imports.ConnectionIO
import gg.uhc.hosts.database.{Database, MatchRow}
import sx.blah.discord.api.IDiscordClient

import scala.concurrent.ExecutionContext
import scala.concurrent.duration._
import scala.language.postfixOps
import scala.util.Random

class NowPlayingTask(database: Database, client: IDiscordClient)(implicit as: ActorSystem) extends Runnable {
  import DiscordHelpers._

  implicit val ec: ExecutionContext = as.dispatcher

  implicit class SeqRandomExtensions[T](s: Seq[T]) {
    def random: Option[T] = s match {
      case Nil      ⇒ None
      case nonempty ⇒ Some(nonempty(Random.nextInt(nonempty.length)))
    }
  }

  val query: ConnectionIO[Option[MatchRow]] = database.getUpcomingMatches.map { rows ⇒
    val now = Instant.now()

    rows.filter { row ⇒
      !row.removed && row.opens.isBefore(now) && row.opens.plus(row.length, ChronoUnit.MINUTES).isAfter(now)
    }.random
  }

  override def run(): Unit =
    database.run(query)
      .flatMap {
        case None ⇒
          as.log.debug("No games in play, showing default message")
          retryRequest {
            client.changePlayingText("uhc!help")
          }
        case Some(row) ⇒
          as.log.debug(s"Match ${row.id} is the chosen one")
          retryRequest {
            client.changePlayingText(s"${row.hostingName.getOrElse(row.author)}'s #${row.count}")
          }
      }
      .map { _ ⇒
        as.scheduler.scheduleOnce(15 seconds, this)
      }
      .failed
      .map { _ ⇒
        as.scheduler.scheduleOnce(30 seconds, this)
      }
}
