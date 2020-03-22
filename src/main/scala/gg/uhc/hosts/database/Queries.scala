package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

import doobie._
import doobie.implicits._
import doobie.postgres._
import doobie.postgres.implicits._
import doobie.postgres.pgisimplicits._
import doobie.implicits.legacy.instant._

import cats.data.NonEmptyList

class Queries(logger: LogHandler) {
  private[this] implicit val logHandler: LogHandler = logger

  def removeMatch(id: Long, reason: String, remover: String): Update0 =
    sql"""
      UPDATE matches
      SET
        removed = true,
        removedReason = $reason,
        removedBy = $remover
      WHERE id = $id
     """.update

  def getUpcomingMatches: Query0[MatchRow] =
    sql"""
       SELECT
        id,
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        removedReason,
        created,
        location,
        version,
        slots,
        length,
        mapSize,
        pvpEnabledAt,
        approvedBy,
        hostingName,
        tournament
       FROM matches
       WHERE opens > ${Instant.now().minus(30, ChronoUnit.MINUTES)}
       ORDER BY opens ASC
    """.query[MatchRow]

  def hostingHistory(host: String, before: Option[Long], count: Int): Query0[MatchRow] =
    (
      sql"""
        SELECT
          id,
          author,
          opens,
          address,
          ip,
          scenarios,
          tags,
          teams,
          size,
          customStyle,
          count,
          content,
          region,
          removed,
          removedBy,
          removedReason,
          created,
          location,
          version,
          slots,
          length,
          mapSize,
          pvpEnabledAt,
          approvedBy,
          hostingName,
          tournament
        FROM matches
      """
        ++ Fragments.whereAndOpt(
          Some(fr"author = $host"),
          before.map(b => fr"id < $b")
        )
        ++ fr" ORDER BY id DESC LIMIT $count"
    ).query[MatchRow]

  def matchById(id: Long): Query0[MatchRow] =
    sql"""
       SELECT
        id,
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        removedReason,
        created,
        location,
        version,
        slots,
        length,
        mapSize,
        pvpEnabledAt,
        approvedBy,
        hostingName,
        tournament
       FROM matches
       WHERE id = $id
    """.query[MatchRow]

  def getMatchesByIds(ids: NonEmptyList[Long]): Query0[MatchRow] =
    (sql"""
       SELECT
        id,
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        removedReason,
        created,
        location,
        version,
        slots,
        length,
        mapSize,
        pvpEnabledAt,
        approvedBy,
        hostingName,
        tournament
       FROM matches
       WHERE """ ++ Fragments.in(fr"id", ids)).query[MatchRow]

  def insertMatch(m: MatchRow): Update0 =
    sql"""
      INSERT INTO matches (
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        removedReason,
        created,
        location,
        version,
        slots,
        length,
        mapSize,
        pvpEnabledAt,
        approvedBy,
        hostingName,
        tournament
      ) VALUES (
        ${m.author},
        ${m.opens},
        ${m.address},
        ${m.ip},
        ${m.scenarios},
        ${m.tags},
        ${m.teams},
        ${m.size},
        ${m.customStyle},
        ${m.count},
        ${m.content},
        ${m.region},
        ${m.removed},
        ${m.removedBy},
        ${m.removedReason},
        ${m.created},
        ${m.location},
        ${m.version},
        ${m.slots},
        ${m.length},
        ${m.mapSize},
        ${m.pvpEnabledAt},
        ${m.approvedBy},
        ${m.hostingName},
        ${m.tournament}
      );""".update

  def isOwnerOfMatch(id: Long, username: String): Query0[Boolean] =
    sql"""
        SELECT
          author
        FROM
          matches
        WHERE
          id = $id
      """.query[String].map(_ == username)

  val getUserCountForEachPermission: Query0[(String, Int)] =
    sql"""
      SELECT
        type,
        count(*)
      FROM permissions
      GROUP BY type
      """.query[(String, Int)]

  def getAllUsersForPermission(permission: String, count: Int): Query0[String] =
    sql"""
      SELECT
        username
      FROM permissions
      WHERE type = $permission
      LIMIT $count
      """.query[String]

  def getUserCountForPermissionByFirstLetter(permission: String): Query0[(String, Int)] =
    sql"""
      SELECT
        lower(left(username, 1)),
        count(*)
      FROM permissions
      WHERE type = $permission
      GROUP BY lower(left(username, 1))
      """.query[(String, Int)]

  def getUsersForPermissionStartingWithLetter(permission: String, letter: String): Query0[String] =
    sql"""
      SELECT
        username
      FROM permissions
      WHERE
        type = $permission
        AND
        lower(left(username, 1)) = lower(${letter.take(1)})
      """.query[String]

  def getPermissions(username: String): Query0[String] =
    sql"""
      SELECT
        type
      FROM
        permissions
      WHERE
        username = $username
     """.query[String]

  def getPermissions(usernames: NonEmptyList[String]): Query0[PermissionSetRow] =
    (
      sql"SELECT username, array_agg(type) FROM permissions " ++
        Fragments.whereAnd(
          Fragments.in(fr"username", usernames)
        ) ++
        fr"GROUP BY username"
    ).query[PermissionSetRow]

  def addPermission(username: String, permission: String): Update0 =
    sql"""INSERT INTO permissions (username, type) VALUES ($username, $permission) ON CONFLICT DO NOTHING"""
      
      .update

  def removePermission(username: String, permission: String): Update0 =
    sql"""DELETE FROM permissions WHERE username = $username AND "type" = $permission"""
      
      .update

  def addPermissionModerationLog(username: String, permission: String, modifier: String, added: Boolean): Update0 =
    sql"""
    INSERT INTO
      permission_moderation_log (modifier, username, at, permission, added)
    VALUES (
      $modifier,
      $username,
      ${Instant.now()},
      $permission,
      $added
    )""".update

  def getPermissionModerationLog(before: Option[Int], count: Int): Query0[PermissionModerationLogRow] =
    (
      sql"SELECT id, modifier, username, at, permission, added FROM permission_moderation_log "
        ++ Fragments.whereAndOpt(
          before.map(id => fr"id < $id")
        )
        ++ fr" ORDER BY id DESC LIMIT $count"
    ).query[PermissionModerationLogRow]

  def updateAuthenticationLog(username: String, ip: InetAddress): Update0 =
    sql"""
      INSERT INTO authentication_log (username, ip, lastToken)
      VALUES ($username, $ip, now())
      ON CONFLICT (username, ip) DO
        UPDATE
          SET lastToken = now()
        WHERE
          authentication_log.username = $username
          AND
          authentication_log.ip = $ip
    """.update

  def getMatchesInDateRangeAndRegion(start: Instant, end: Instant, region: String): Query0[MatchRow] =
    sql"""
      SELECT
        *
      FROM matches
      WHERE
        region = $region
        AND
        opens BETWEEN $start AND $end
        AND
        removed = false
      """.query[MatchRow]

  def getUserApiKey(username: String): Query0[String] =
    sql"SELECT apiKey FROM user_api_keys WHERE username = $username".query[String]

  def setUserApiKey(username: String, key: String): Update0 =
    sql"""
      INSERT INTO user_api_keys (username, apiKey)
      VALUES ($username, $key)
      ON CONFLICT (username) DO
        UPDATE
          SET apiKey = $key
        WHERE
          user_api_keys.username = $username
       """.update

  val getLatestRules: Query0[RulesRow] =
    sql"""
      SELECT
        id,
        author,
        modified,
        content
      FROM rules
      ORDER BY id DESC
      LIMIT 1
      """.query[RulesRow]

  def setRules(author: String, content: String): Update0 =
    sql"""
      INSERT INTO rules (author, modified, content) VALUES (
        $author,
        NOW(),
        $content
      )
      """.update

  def approveMatch(id: Long, approver: String): Update0 =
    sql"""
      UPDATE matches
      SET
        approvedBy = $approver
      WHERE
        id = $id
      """.update

  def getCurrentUbl: Query0[UblRow] =
    sql"""
      SELECT
        id,
        ign,
        uuid,
        reason,
        created,
        expires,
        link,
        createdBy
      FROM ubl
      WHERE
        expires > NOW()
      ORDER BY created DESC
      """.query[UblRow]

  def createUblEntry(entry: UblRow): Update0 =
    sql"""
      INSERT INTO ubl (ign, uuid, reason, created, expires, link, createdBy)
      VALUES (
        ${entry.ign},
        ${entry.uuid},
        ${entry.reason},
        ${entry.created},
        ${entry.expires},
        ${entry.link},
        ${entry.createdBy}
      )
      """.update

  def getUblEntriesForUuid(uuid: UUID): Query0[UblRow] =
    sql"""
      SELECT
        id,
        ign,
        uuid,
        reason,
        created,
        expires,
        link,
        createdBy
      FROM ubl
      WHERE
        uuid = $uuid
      ORDER BY created DESC
      """.query[UblRow]

  def getUblEntry(id: Long): Query0[UblRow] =
    sql"""
      SELECT
        id,
        ign,
        uuid,
        reason,
        created,
        expires,
        link,
        createdBy
      FROM ubl
      WHERE
        id = $id
      """.query[UblRow]

  def searchUblUsername(username: String): Query0[(String, List[UUID])] =
    sql"""
      SELECT
        ign,
        array_agg(distinct uuid)
      FROM ubl
      WHERE
        ign ILIKE ${s"%$username%"}
      GROUP BY ign
      LIMIT 21
      """.query[(String, List[UUID])]

  def editUblEntry(row: UblRow): Update0 =
    sql"""
      UPDATE ubl
      SET
        ign = ${row.ign},
        uuid = ${row.uuid},
        reason = ${row.reason},
        created = ${row.created},
        expires = ${row.expires},
        link = ${row.link},
        createdBy = ${row.createdBy}
      WHERE id = ${row.id}
      """.update

  def deleteUblEntry(id: Long): Update0 =
    sql"""
      DELETE FROM ubl
      WHERE id = $id
      """.update

  def getUnprocessedDiscordMatches: Query0[MatchRow] =
    sql"""
      SELECT
        id,
        author,
        opens,
        address,
        ip,
        scenarios,
        tags,
        teams,
        size,
        customStyle,
        count,
        content,
        region,
        removed,
        removedBy,
        removedReason,
        created,
        location,
        version,
        slots,
        length,
        mapSize,
        pvpEnabledAt,
        approvedBy,
        hostingName,
        tournament
      FROM matches
      WHERE
        handledDiscord = false
        AND
        removed = false
        AND
        opens > now()
    """.query[MatchRow]

  def flagMatchesAsProcessedForDiscord(ids: NonEmptyList[Long]): Update0 =
    (sql"""
      UPDATE
        matches
      SET
        handledDiscord = true
      WHERE """ ++
      Fragments.in(fr"id", ids)).update

  val unapprovedUpcomingMatchesCount: Query0[Int] =
    sql"""
      SELECT
        COUNT(*)
      FROM matches
      WHERE
        approvedBy IS NULL
        AND
        removed = FALSE
        AND
        opens > NOW()
      """.query[Int]

  def createAlertRule(rule: AlertRuleRow): Update0 =
    sql"""
      INSERT INTO alert_rules
        (field, alertOn, exact, createdBy, created)
      VALUES
        (${rule.field}, ${rule.alertOn}, ${rule.exact}, ${rule.createdBy}, ${rule.created})
      """.update

  val getAllAlertRules: Query0[AlertRuleRow] =
    sql"""
      SELECT
        id,
        field,
        alertOn,
        exact,
        createdBy,
        created
      FROM
        alert_rules
      """.query[AlertRuleRow]

  def deleteAlertRule(id: Long): Update0 =
    sql"""
      DELETE FROM alert_rules
      WHERE id = $id
      """.update

  def createAlert(matchId: Long, triggeredRuleId: Long): Update0 =
    sql"""
      INSERT INTO alerts
        (matchId, triggeredRuleId)
      VALUES
        ($matchId, $triggeredRuleId)
      """.update

  val getAlertsForDiscord: Query0[AlertRow] =
    sql"""
      SELECT
        matchId, triggeredRuleId
      FROM
        alerts
      WHERE
        discord = false
      """.query[AlertRow]

  def setAlertsHandledForDiscord(matchId: Long): Update0 =
    sql"""
      UPDATE
        alerts
      SET
        discord = true
      WHERE
        matchId = $matchId
      """.update
}
