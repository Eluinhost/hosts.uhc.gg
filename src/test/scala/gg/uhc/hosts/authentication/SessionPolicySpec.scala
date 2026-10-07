package gg.uhc.hosts.authentication

import com.typesafe.config.ConfigFactory
import munit.FunSuite

import java.time.{Duration, Instant}

class SessionPolicySpec extends FunSuite {
  private val now    = Instant.parse("2026-10-08T12:00:00Z")
  private val policy = SessionPolicy(Duration.ofDays(8), Duration.ofDays(90), Duration.ofDays(1))

  test("a session seen an hour ago is valid") {
    assert(policy.isValid(now.minusSeconds(3600), now.plus(Duration.ofDays(80)), now))
  }

  test("a session idle for nine days is not valid") {
    assert(!policy.isValid(now.minus(Duration.ofDays(9)), now.plus(Duration.ofDays(80)), now))
  }

  test("a session exactly at the idle boundary is not valid") {
    assert(!policy.isValid(now.minus(Duration.ofDays(8)), now.plus(Duration.ofDays(80)), now))
  }

  test("a session past the absolute cap is not valid, however fresh it looks") {
    assert(!policy.isValid(now, now.minusSeconds(1), now))
  }

  test("expiry slides the idle window from lastSeen") {
    val lastSeen = now.minusSeconds(3600)

    assertEquals(policy.expiresAt(lastSeen, now.plus(Duration.ofDays(80)), now), lastSeen.plus(Duration.ofDays(8)))
  }

  test("expiry never runs past the absolute cap") {
    val cap = now.plusSeconds(60)

    assertEquals(policy.expiresAt(now, cap, now), cap)
  }

  test("rotation happens once the rotate interval has passed") {
    assert(policy.shouldRotate(now.minus(Duration.ofDays(1)), now))
    assert(!policy.shouldRotate(now.minusSeconds(3600), now))
  }

  test("the policy is read from the session config block") {
    val fromConfig = SessionPolicy.fromConfig(ConfigFactory.load())

    assertEquals(fromConfig.idleTimeout, Duration.ofDays(8))
    assertEquals(fromConfig.absoluteTimeout, Duration.ofDays(90))
    assertEquals(fromConfig.rotateInterval, Duration.ofDays(1))
  }
}
