package gg.uhc.hosts.endpoints.matches

import java.time.temporal.ChronoUnit
import java.time.{Instant, ZoneOffset}

import akka.http.scaladsl.server.Directives.{pass, reject, validate}
import akka.http.scaladsl.server.{Directive0, ValidationRejection}
import gg.uhc.hosts.endpoints.versions.Version
import gg.uhc.hosts.{SizedTeamStyle, TeamStyles}

object CreateMatchValidation {
  val ALLOWED_REGIONS = List("NA", "SA", "AS", "EU", "AF", "OC")

  private[this] def optionalValidate[T](data: Option[T], message: String)(p: T => Boolean) =
    data
      .map { item =>
        validate(p(item), message)
      }
      .getOrElse(pass)

  def validateIp(payload: CreateMatchPayload): Directive0 = {
    // treat empty strings as non-provided
    val valIp      = payload.ip.filter(_.nonEmpty)
    val valAddress = payload.address.filter(_.nonEmpty)

    if (valIp.isEmpty && valAddress.isEmpty)
      reject(ValidationRejection("Either an IP or an address must be provided (or both)"))

    val ipCheck = optionalValidate(valIp, "Invalid IP supplied, expected format 111.222.333.444[:55555]") { ip =>
      """^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$""".r.findFirstMatchIn(ip).exists { m =>
        val octets = (1 to 4).map(m.group(_).toInt).forall(i => i >= 0 && i <= 255)
        val port   = Option(m.group(5)).map(_.toInt)

        octets && (port.isEmpty || port.exists(p => p <= 65535 && p >= 1))
      }
    }

    val addressCheck = optionalValidate(valAddress.map(_.trim), "Address must be at least 5 chars") { address =>
      address.length >= 5
    }

    ipCheck & addressCheck
  }

  def validatePayload(payload: CreateMatchPayload): Directive0 =
    // TODO allow editing on a different timer
    validate(
      payload.opens.isAfter(Instant.now().plus(30, ChronoUnit.MINUTES)),
      "Must be at least 30 minutes in advance"
    ) &
      validate(payload.opens.isBefore(Instant.now().plus(30, ChronoUnit.DAYS)), "Must be at most 30 days in advance") &
      validate(
        payload.opens.atOffset(ZoneOffset.UTC).getMinute % 15 == 0,
        "Minutes must be on exactly xx:00 xx:15 xx:30 or xx:45 in an hour (UTC)"
      ) &
      validateIp(payload) &
      validate(payload.location.nonEmpty, "Must supply a location") &
      validate(
        Version.options.exists(v => v.displayName == payload.mainVersion),
        s"Invalid main version, expected one of: ${Version.options.map(v => v.displayName).mkString(", ")}"
      ) &
      validate(payload.version.nonEmpty, "Must supply a version") &
      validate(payload.slots >= 2, "Slots must be at least 2") &
      validate(payload.length >= 30, "Matches must be at least 30 minutes") &
      validate(payload.mapSize > 0, "Map size must be positive") &
      validate(payload.pvpEnabledAt >= 0, "PVP enabled at must be positive") &
      validate(payload.scenarios.nonEmpty, "Must supply at least 1 scenario") &
      validate(payload.scenarios.length <= 25, "Must supply at most 25 scenarios") &
      validate(payload.tags.length <= 5, "Must supply at most 5 tags") &
      validate(TeamStyles.byCode.contains(payload.teams), "Unknown team style") &
      validate(payload.content.nonEmpty, "Must provide some post content") &
      validate(ALLOWED_REGIONS.contains(payload.region), "Invalid region supplied") &
      validate(
        // either doesn't require size or size is within range
        !TeamStyles.byCode(payload.teams).isInstanceOf[SizedTeamStyle]
          || payload.size.exists(size => size >= 0 && size <= 32767),
        "Invalid value for size"
      ) &
      validate(
        payload.teams != "custom" || payload.customStyle.exists(_.nonEmpty),
        "A custom style must be given when 'custom' is picked"
      ) &
      validate(payload.count >= 1, "Count must be at least 1")
}
