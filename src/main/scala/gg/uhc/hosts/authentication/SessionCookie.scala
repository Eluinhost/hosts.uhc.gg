package gg.uhc.hosts.authentication

import java.time.Instant

import org.apache.pekko.http.scaladsl.model.DateTime
import org.apache.pekko.http.scaladsl.model.headers.{HttpCookie, SameSite}

object SessionCookie {
  val name: String = "__Host-uhcgg_session"

  def from(id: String, expiresAt: Instant): HttpCookie =
    HttpCookie(
      name = name,
      value = id,
      expires = Some(DateTime(expiresAt.toEpochMilli)),
      secure = true,
      httpOnly = true,
      path = Some("/")
    ).withSameSite(SameSite.Lax)

  val expired: HttpCookie =
    HttpCookie(
      name = name,
      value = "",
      expires = Some(DateTime(0L)),
      secure = true,
      httpOnly = true,
      path = Some("/")
    ).withSameSite(SameSite.Lax)
}
