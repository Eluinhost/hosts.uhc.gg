package gg.uhc.hosts.authentication

import java.time.{Duration, Instant}

import com.typesafe.config.Config

case class SessionPolicy(idleTimeout: Duration, absoluteTimeout: Duration, rotateInterval: Duration) {
  def isValid(lastSeen: Instant, absoluteExpiry: Instant, now: Instant): Boolean =
    lastSeen.plus(idleTimeout).isAfter(now) && absoluteExpiry.isAfter(now)

  def expiresAt(lastSeen: Instant, absoluteExpiry: Instant, now: Instant): Instant = {
    val idleExpiry = lastSeen.plus(idleTimeout)

    if idleExpiry.isBefore(absoluteExpiry) then idleExpiry else absoluteExpiry
  }

  def shouldRotate(lastRotated: Instant, now: Instant): Boolean =
    Duration.between(lastRotated, now).compareTo(rotateInterval) >= 0
}

object SessionPolicy {
  def fromConfig(config: Config): SessionPolicy =
    SessionPolicy(
      idleTimeout = config.getDuration("session.idleTimeout"),
      absoluteTimeout = config.getDuration("session.absoluteTimeout"),
      rotateInterval = config.getDuration("session.rotateInterval")
    )
}
