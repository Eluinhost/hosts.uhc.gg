package gg.uhc.hosts

import gg.uhc.hosts.database.{AlertRuleRow, MatchRow}

object Alerts {
  val allAlertFields: List[String] = "ip" :: "address" :: "hosting name" :: "content" :: "tags" :: Nil

  implicit class MatchRowAlertExtensions(m: MatchRow) {
    def matchesRule(rule: AlertRuleRow): Boolean             = getViolatingText(rule).isDefined
    def getViolatingText(rule: AlertRuleRow): Option[String] = findViolationText(rule, m)
  }

  implicit class AlertRuleRowAlertExtensions(rule: AlertRuleRow) {
    def matchesRow(m: MatchRow): Boolean              = getViolationText(m).isDefined
    def getViolationText(m: MatchRow): Option[String] = findViolationText(rule, m)
  }

  def findViolationText(rule: AlertRuleRow, m: MatchRow): Option[String] = {
    val listToSearch: List[String] = rule.field match {
      case "tags"         ⇒ m.tags
      case "ip"           ⇒ m.ip.toList
      case "address"      ⇒ m.address.toList
      case "hosting name" ⇒ m.hostingName.toList
      case "content"      ⇒ List(m.content)
    }

    val alertOn = rule.alertOn.toLowerCase

    if (rule.exact) {
      listToSearch.find(item ⇒ item.toLowerCase == alertOn)
    } else {
      listToSearch.find(item ⇒ item.toLowerCase.contains(alertOn))
    }
  }
}
