package gg.uhc.hosts.endpoints.matches

import gg.uhc.hosts.database.MatchRow

case class OverhostedException(overhosted: MatchRow) extends Throwable
