package gg.uhc.hosts.database

import java.time.Instant
import java.time.temporal.ChronoUnit

import doobie.imports._
import doobie.postgres.imports._

import scalaz.NonEmptyList

object Queries {
  implicit val logHandler: LogHandler = LogHandler.jdkLogHandler

  case class MatchRow(
      id: Int,
      author: String,
      opens: Instant,
      address: Option[String],
      ip: String,
      scenarios: List[String],
      tags: List[String],
      teams: String,
      size: Option[Int],
      customStyle: Option[String],
      count: Int,
      content: String,
      region: String,
      removed: Boolean,
      removedBy: Option[String],
      removedReason: Option[String],
      created: Instant,
      location: String,
      version: String,
      slots: Int,
      length: Int,
      mapSizeX: Int,
      mapSizeZ: Int,
      pvpEnabledAt: Int)

  case class PermissionSet(username: String, permissions: List[String])

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

  def getPermissions(usernames: NonEmptyList[String]): Query0[PermissionSet] =
    (
      sql"SELECT username, array_agg(type) FROM permissions ".asInstanceOf[Fragment] ++
        Fragments.whereAnd(
          Fragments.in(fr"username".asInstanceOf[Fragment], usernames)
        ) ++
        fr"GROUP BY username".asInstanceOf[Fragment]
    ).query[PermissionSet]

}
