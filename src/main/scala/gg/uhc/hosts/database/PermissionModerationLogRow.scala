package gg.uhc.hosts.database

import java.time.Instant

case class PermissionModerationLogRow(
    id: Int,
    modifier: String,
    username: String,
    at: Instant,
    permission: String,
    added: Boolean)
