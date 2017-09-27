package gg.uhc.hosts.database

import java.time.Instant

case class AlertRuleRow(id: Long, field: String, alertOn: String, exact: Boolean, createdBy: String, created: Instant)
