package gg.uhc.hosts.discord

import java.awt.Color

import akka.actor.ActorSystem
import doobie.imports.ConnectionIO
import gg.uhc.hosts.database.{AlertRuleRow, Database, MatchRow}
import gg.uhc.hosts.Alerts
import sx.blah.discord.api.IDiscordClient
import sx.blah.discord.api.internal.json.objects.EmbedObject
import sx.blah.discord.handle.obj.IChannel

import scala.concurrent.duration.FiniteDuration
import scala.concurrent.{ExecutionContext, Future}

class SendWaitingAlertsTask(
    database: Database,
    client: IDiscordClient,
    channels: List[IChannel],
    flushDuration: FiniteDuration
  )(implicit as: ActorSystem)
    extends Runnable {
  import DiscordHelpers._
  import Alerts._

  implicit val ec: ExecutionContext = as.dispatcher

  private[this] def buildViolationAlert(m: Entry): EmbedObject = {
    var embed = m.matchRow.baseEmbed.withColor(Color.RED)

    m.rules.foreach { rule ⇒
      embed = embed.appendField(
        s"*Triggered: `${rule.field} ${if (rule.exact) "=" else "~"} '${rule.alertOn}'`*",
        s"${rule.getViolationText(m.matchRow).getOrElse("No violation found")}",
        false
      )
    }

    embed.build()
  }

  case class Entry(matchRow: MatchRow, rules: List[AlertRuleRow])

  def getWaitingAlerts(): ConnectionIO[List[Entry]] =
    for {
      alerts ← database.getAlertsForDiscord()
      rules  ← database.getAllAlertRules()
      rulesById: Map[Long, AlertRuleRow] = rules.map(r ⇒ r.id → r).toMap
      rulesByMatchId: Map[Long, List[AlertRuleRow]] = alerts
        .groupBy(_.matchId)
        .mapValues(_.map { alert ⇒
          rulesById(alert.triggeredRuleId)
        })
      matches ← database.getMatchesByIds(alerts.map(_.matchId).distinct)
    } yield matches.map(m ⇒ Entry(matchRow = m, rules = rulesByMatchId(m.id)))

  override def run(): Unit =
    (for {
      alerts ← database.run(getWaitingAlerts())
      _ = as.log.info(s"Found ${alerts.size} alerts to process")
      _ ← alerts.foldLeft(Future.unit) { (prevFuture, alert) ⇒
        for {
          _ ← prevFuture
          _ ← buildViolationAlert(alert).sendToChannels(channels)
          _ ← database.run(database.setAlertsHandledForDiscord(alert.matchRow.id))
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
