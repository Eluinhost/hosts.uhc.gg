package gg.uhc.hosts.authentication

import java.time.{Duration, Instant}

import munit.FunSuite
import org.apache.pekko.http.scaladsl.model.headers.SameSite

class SessionCookieSpec extends FunSuite {
  private val now = Instant.parse("2026-10-08T12:00:00Z")

  test("cookie carries the session id with __Host- secure attributes") {
    val expires = now.plus(Duration.ofDays(8))
    val cookie  = SessionCookie.from("abc123", expires)

    assertEquals(cookie.name, "__Host-uhcgg_session")
    assertEquals(cookie.value, "abc123")
    assert(cookie.secure)
    assert(cookie.httpOnly)
    assertEquals(cookie.sameSite, Some(SameSite.Lax))
    assertEquals(cookie.path, Some("/"))
    assertEquals(cookie.domain, None)
    assert(cookie.expires.exists(_.clicks <= expires.toEpochMilli))
    assertEquals(cookie.maxAge, None)
  }

  test("the delete cookie expires in the past") {
    val cookie = SessionCookie.expired

    assertEquals(cookie.name, "__Host-uhcgg_session")
    assertEquals(cookie.value, "")
    assert(cookie.expires.exists(_.clicks <= System.currentTimeMillis()))
    assert(cookie.secure && cookie.httpOnly)
    assertEquals(cookie.path, Some("/"))
    assertEquals(cookie.maxAge, None)
  }

  test("the delete cookie matches the session cookie on every attribute") {
    val from    = SessionCookie.from("abc123", now.plus(Duration.ofDays(8)))
    val expired = SessionCookie.expired

    assertEquals(expired.domain, from.domain)
    assertEquals(expired.path, from.path)
    assertEquals(expired.secure, from.secure)
    assertEquals(expired.httpOnly, from.httpOnly)
    assertEquals(expired.sameSite, from.sameSite)
    assertEquals(expired.maxAge, from.maxAge)
  }
}
