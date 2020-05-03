package gg.uhc.hosts.endpoints.matches

import gg.uhc.hosts.database.MatchRow

class UserNotAllowedToEditException(val row: MatchRow) extends Throwable
