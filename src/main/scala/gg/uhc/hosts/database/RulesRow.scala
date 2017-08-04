package gg.uhc.hosts.database

import java.time.Instant

case class RulesRow(id: Int, author: String, modified: Instant, content: String)
