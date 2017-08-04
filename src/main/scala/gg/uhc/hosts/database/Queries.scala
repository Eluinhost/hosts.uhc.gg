package gg.uhc.hosts.database

import java.net.InetAddress
import java.time.Instant
import java.time.temporal.ChronoUnit

import doobie.imports._
import doobie.postgres.imports._

import scalaz.NonEmptyList

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
     """.asInstanceOf[Fragment].update

  def listMathes: Query0[MatchRow] =
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
        mapSizeX,
        mapSizeZ,
        pvpEnabledAt
       FROM matches
       WHERE opens > ${Instant.now().minus(30, ChronoUnit.MINUTES)}
       ORDER BY opens ASC
    """.asInstanceOf[Fragment].query[MatchRow]

  def matchById(id: Int): Query0[MatchRow] =
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
        mapSizeX,
        mapSizeZ,
        pvpEnabledAt
       FROM matches
       WHERE id = $id
    """.asInstanceOf[Fragment].query[MatchRow]

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
        mapSizeX,
        mapSizeZ,
        pvpEnabledAt
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
        ${m.mapSizeX},
        ${m.mapSizeZ},
        ${m.pvpEnabledAt}
      );""".asInstanceOf[Fragment].update

  def isOwnerOfMatch(id: Long, username: String): Query0[Boolean] =
    sql"""
        SELECT
          author
        FROM
          matches
        WHERE
          id = $id
      """.asInstanceOf[Fragment].query[String].map(_ == username)

  def getPermissions(username: String): Query0[String] =
    sql"""
      SELECT
        type
      FROM
        permissions
      WHERE
        username = $username
     """.asInstanceOf[Fragment].query[String]

  def getPermissions(usernames: NonEmptyList[String]): Query0[PermissionSetRow] =
    (
      sql"SELECT username, array_agg(type) FROM permissions ".asInstanceOf[Fragment] ++
        Fragments.whereAnd(
          Fragments.in(fr"username".asInstanceOf[Fragment], usernames)
        ) ++
        fr"GROUP BY username".asInstanceOf[Fragment]
    ).query[PermissionSetRow]

  def addPermission(username: String, permission: String): Update0 =
    sql"""INSERT INTO permissions (username, type) VALUES ($username, $permission) ON CONFLICT DO NOTHING"""
      .asInstanceOf[Fragment]
      .update

  def removePermission(username: String, permission: String): Update0 =
    sql"""DELETE FROM permissions WHERE username = $username AND "type" = $permission"""
      .asInstanceOf[Fragment]
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
    )""".asInstanceOf[Fragment].update

  def getPermissionModerationLog(before: Option[Int], count: Int): Query0[PermissionModerationLogRow] =
    (
      sql"SELECT id, modifier, username, at, permission, added FROM permission_moderation_log ".asInstanceOf[Fragment]
        ++ Fragments.whereAndOpt(
          before.map(id ⇒ fr"id < $id".asInstanceOf[Fragment])
        )
        ++ fr" ORDER BY id DESC LIMIT $count".asInstanceOf[Fragment]
    ).query[PermissionModerationLogRow]

  val getAllRoleMembers: Query0[(String, List[String])] =
    sql"SELECT type, array_agg(username) FROM permissions GROUP BY type"
      .asInstanceOf[Fragment]
      .query[(String, List[String])]

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
    """.asInstanceOf[Fragment].update

  def getMatchesInDateRangeAndRegion(start: Instant, end: Instant, region: String): Query0[MatchRow] =
    sql"""
      SELECT
        *
      FROM matches
      WHERE
        region = $region
        AND
        opens BETWEEN $start AND $end
      """.asInstanceOf[Fragment].query[MatchRow]

  def getUserApiKey(username: String): Query0[String] =
    sql"SELECT apiKey FROM user_api_keys WHERE username = $username".asInstanceOf[Fragment].query[String]

  def setUserApiKey(username: String, key: String): Update0 =
    sql"""
      INSERT INTO user_api_keys (username, apiKey)
      VALUES ($username, $key)
      ON CONFLICT (username) DO
        UPDATE
          SET apiKey = $key
        WHERE
          user_api_keys.username = $username
       """.asInstanceOf[Fragment].update
}
