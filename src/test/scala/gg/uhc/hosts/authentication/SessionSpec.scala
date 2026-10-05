package gg.uhc.hosts.authentication

import java.time.{Duration, Instant}

import com.typesafe.config.ConfigFactory
import gg.uhc.hosts.authentication.Session.{Authenticated, RefreshToken}
import io.circe.parser.parse
import pdi.jwt.{JwtAlgorithm, JwtCirce, JwtClaim}
import pdi.jwt.algorithms.JwtHmacAlgorithm

/**
 * Access and refresh tokens share the same signing scheme, so they must be kept apart by both their `typ` claim and
 * their signing key. `RefreshToken.fromJwt` previously decoded an access token successfully because circe ignores the
 * unknown `permissions` field, which let a short lived access token mint a new 28 hour refresh token.
 */
class SessionSpec extends munit.FunSuite {
  private val config        = ConfigFactory.load()
  private val accessSecret  = config.getString("jwt.secret")
  private val refreshSecret = config.getString("jwt.refreshSecret")
  private val algorithm     = JwtAlgorithm.fromString(config.getString("jwt.algorithm")) match {
    case hmac: JwtHmacAlgorithm => hmac
    case _                      => fail("jwt.algorithm must be an HMAC algorithm")
  }

  private val permissions = List("admin", "hosting advisor")

  test("separate secrets are configured for tests") {
    assert(accessSecret != refreshSecret, "jwt.secret and jwt.refreshSecret must differ for these tests to be valid")
  }

  test("access token round trips") {
    val token = Authenticated("test_user", permissions).toJwt

    assertEquals(Authenticated.fromJwt(token), Some(Authenticated("test_user", permissions)))
  }

  test("refresh token round trips") {
    val token = RefreshToken("test_user").toJwt

    assertEquals(RefreshToken.fromJwt(token), Some(RefreshToken("test_user")))
  }

  test("issued tokens carry their type") {
    assertEquals(claimType(Authenticated("test_user", permissions).toJwt), Some("access"))
    assertEquals(claimType(RefreshToken("test_user").toJwt), Some("refresh"))
  }

  test("access token is not accepted as a refresh token") {
    val accessToken = Authenticated("test_user", permissions).toJwt

    assertEquals(RefreshToken.fromJwt(accessToken), None, "access token was accepted as a refresh token")
  }

  test("refresh token is not accepted as an access token") {
    val refreshToken = RefreshToken("test_user").toJwt

    assertEquals(Authenticated.fromJwt(refreshToken), None, "refresh token was accepted as an access token")
  }

  test("token signed with the access key is not accepted as a refresh token") {
    val forged = sign("""{"typ":"refresh","username":"test_user"}""", accessSecret, Duration.ofHours(1))

    assertEquals(RefreshToken.fromJwt(forged), None)
  }

  test("token signed with the refreh key is not accepted as an access token") {
    val forged = sign(
      s"""{"typ":"access","username":"test_user","permissions":["admin","hosting advisor"]}""",
      refreshSecret,
      Duration.ofHours(1)
    )

    assertEquals(Authenticated.fromJwt(forged), None)
  }

  test("token without a type claim is rejected") {
    val legacyAccess  = sign("""{"username":"test_user","permissions":[]}""", accessSecret, Duration.ofHours(1))
    val legacyRefresh = sign("""{"username":"test_user"}""", refreshSecret, Duration.ofHours(1))

    assertEquals(Authenticated.fromJwt(legacyAccess), None)
    assertEquals(RefreshToken.fromJwt(legacyRefresh), None)
  }

  test("expired token is rejected") {
    val signed =
      sign("""{"typ":"access","username":"test_user","permissions":[]}""", accessSecret, Duration.ofMinutes(-1))

    assertEquals(Authenticated.fromJwt(signed), None)
  }

  test("tampered token is rejected") {
    val token    = RefreshToken("test_user").toJwt
    val tampered = token.dropRight(1) + (if token.last == 'a' then 'b' else 'a')

    assertEquals(RefreshToken.fromJwt(tampered), None, "signature change was accepted")
    assertEquals(RefreshToken.fromJwt(swapUsernameInPayload(token)), None, "payload change was accepted")
  }

  private def claimType(jwt: String): Option[String] =
    for {
      claim <- JwtCirce.decode(jwt, accessSecret, Seq(algorithm)).toOption
                 .orElse(JwtCirce.decode(jwt, refreshSecret, Seq(algorithm)).toOption)
      json  <- parse(claim.content).toOption
      typ   <- json.hcursor.get[String]("typ").toOption
    } yield typ

  private def swapUsernameInPayload(jwt: String): String = {
    val Array(header, payload, signature) = jwt.split('.')
    val contents                          = new String(java.util.Base64.getUrlDecoder.decode(payload), "utf-8")
    val swapped                           = contents.replace("test_user", "someone-else")

    s"$header.${java.util.Base64.getUrlEncoder.withoutPadding.encodeToString(swapped.getBytes("utf-8"))}.$signature"
  }

  private def sign(content: String, secret: String, validFor: Duration): String = {
    val now = Instant.now()

    JwtCirce.encode(
      JwtClaim(
        content = content,
        expiration = Some(now.plus(validFor).getEpochSecond),
        issuedAt = Some(now.getEpochSecond)
      ),
      secret,
      algorithm
    )
  }
}
