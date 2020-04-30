package gg.uhc.hosts.endpoints.matches

import java.time.format.DateTimeFormatter
import java.time.{Instant, ZoneOffset}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{entity, _}
import akka.http.scaladsl.server._
import doobie._
import doobie.free.connection.{pure, raiseError}
import gg.uhc.hosts.Alerts._
import gg.uhc.hosts.CustomJsonCodec._
import gg.uhc.hosts._
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.{BasicCache, CustomDirectives, DatabaseErrorRejection, EndpointRejectionHandler}
import gg.uhc.hosts.endpoints.matches.websocket.MatchesWebsocket

import scala.util.{Failure, Success}

/**
  * Creates a new Match object. Requires login + 'host' permission
  */
class CreateMatch(
    customDirectives: CustomDirectives,
    database: Database,
    cache: BasicCache,
    websocket: MatchesWebsocket) {
  import customDirectives._

  /**
    * Converts the payload into an insertable MatchRow, does not validate any input
    */
  private[this] def convertPayload(payload: CreateMatchPayload, author: String): MatchRow = {
    var row = MatchRow(
      address = payload.address,
      content = payload.content,
      count = payload.count,
      customStyle = if (payload.teams == "custom") payload.customStyle else None, // remove if not custom
      ip = payload.ip,
      // Replace time with the UTC offset and set everything sub-minute accuracy to 0
      opens = payload.opens.atOffset(ZoneOffset.UTC).withSecond(0).withNano(0).toInstant,
      region = payload.region,
      teams = payload.teams,
      size = if (TeamStyles.byCode.get(payload.teams).exists(_.isInstanceOf[SizedTeamStyle])) payload.size else None, // remove size if not required
      location = payload.location,
      mainVersion = payload.mainVersion,
      version = payload.version,
      slots = payload.slots,
      length = payload.length,
      mapSize = payload.mapSize,
      pvpEnabledAt = payload.pvpEnabledAt,
      scenarios = payload.scenarios.distinctBy(_.toLowerCase), // removes duplicates
      tags = payload.tags.distinctBy(_.toLowerCase), // removes duplicates
      tournament = payload.tournament,
      originalEditId = payload.originalEditId,
      // non-user payload.vars below
      id = -1,
      created = Instant.now(),
      author = author,
      removed = false,
      removedBy = None,
      removedReason = None,
      approvedBy = None,
      hostingName = payload.hostingName.filter(!_.isEmpty),
      latestEditId = None
    )

    // Automatically add the 'rush' scenario for games < 45 minutes long if it doesn't already have it and isn't a tournament
    if (!row.tournament && row.length < 45 && !row.scenarios.exists(_.toLowerCase == "rush")) {
      row = row.copy(scenarios = row.scenarios :+ "Rush")
    }

    row
  }

  private[this] def getBestOverhostMatch(row: MatchRow): ConnectionIO[Option[MatchRow]] =
    database.getPotentialConflicts(start = row.opens, end = row.opens, version = row.version, region = row.region).map {
      // Its valid if:
      //  - there are no conflicts
      //  - this is a non-tournament and conflicts are all tournaments
      case conflicts if conflicts.isEmpty =>
        None
      case conflicts if !row.tournament && conflicts.forall(_.tournament) =>
        None
      case conflicts =>
        // Try to find a non-tournament to tell, otherwise just give whatever was returned first
        conflicts.find(!_.tournament).orElse(conflicts.headOption)
    }

  private[this] def removePreviousEdits(id: Long, author: String): ConnectionIO[Unit] =
    for {
      maybeExisting <- database.getMatchById(id)
      // TODO check permission (same author as original?)
      existing <- maybeExisting.map(pure).getOrElse(raiseError(EditIdDoesNotExistException(id)))
      // if there is no original edit ID then this is the original and we want to just use the ID
      originalId = existing.originalEditId.getOrElse(existing.id)
      _ <- database.removePreviousEdits(originalId, "match edited", author)
    } yield ()

  private[this] def createMatchAndAlerts(payload: CreateMatchPayload, author: String): ConnectionIO[MatchRow] =
    for {
      // remove any previous edits if we need to first
      _ <- payload.originalEditId.map(id => removePreviousEdits(id, author)).getOrElse(pure(()))
      row = convertPayload(payload, author)
      // if they're overhosting then fail the request
      maybeOverhost <- getBestOverhostMatch(row)
      _ <- maybeOverhost
        .map(overhost => raiseError(OverhostedException(overhost)))
        // otherwise just continue on
        .getOrElse(pure(()))
      id       <- database.insertMatch(row)
      // if we were editing a match then set the latestEditId for all of them
      _ <- payload.originalEditId
        .map(originalId => database.updatePreviousEditsToLatestId(originalEditId = originalId, newLatestEditId = id))
        .getOrElse(pure(()))
      allRules <- database.getAllAlertRules()
      matchedRules = allRules.filter { _.matchesRow(row) }
      addedAlertCount <- matchedRules.foldLeft(pure(0)) { (prev, rule) => // reduce to run each in series, one for each alert
        prev.flatMap { count =>
          database.createAlert(matchId = id, triggeredRuleId = rule.id).map(_ + count)
        }
      }
    } yield row.copy(id = id)

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requireAtLeastOnePermission("host" :: "trial host" :: Nil, session.username) {
          entity(as[CreateMatchPayload]) { entity =>
            // basic input validations
            CreateMatchValidation.validatePayload(entity) {
              // run our transaction
              onComplete(database.run(createMatchAndAlerts(entity, session.username))) {
                case Success(inserted) =>
                  cache.invalidateUpcomingMatches()
                  websocket.notifyMatchCreated(inserted)
                  complete(StatusCodes.Created -> inserted)
                case Failure(OverhostedException(overhost)) =>
                  val hours = overhost.opens.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("HH:mm"))
                  reject(ValidationRejection(
                    s"Conflicts with /u/${overhost.author}'s #${overhost.count} (${overhost.region} - $hours) in ${overhost.mainVersion}"))
                case Failure(EditIdDoesNotExistException(id)) =>
                  reject(ValidationRejection(s"Unknown ID for editing '${id}'"))
                case Failure(t) => reject(DatabaseErrorRejection(t))
              }
            }
          }
        }
      }
    }
}
