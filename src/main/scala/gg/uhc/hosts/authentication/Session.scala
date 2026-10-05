package gg.uhc.hosts.authentication

import java.time.{Duration, Instant}

import com.typesafe.config.ConfigFactory
import io.circe.{Decoder, Encoder, Json}
import io.circe.derivation.{Configuration, ConfiguredDecoder, ConfiguredEncoder}
import io.circe.parser.parse
import io.circe.syntax.*
import pdi.jwt.{JwtAlgorithm, JwtCirce, JwtClaim}
import pdi.jwt.algorithms.JwtHmacAlgorithm

sealed trait Session {
  def toJwt: String
}

object Session {
  private val config                          = ConfigFactory.load()
  private val jwtAccessTokenSecret: String    = config.getString("jwt.secret")
  private val jwtRefreshTokenSecret: String   = config.getString("jwt.refreshSecret")
  private val jwtAlgorithm: JwtHmacAlgorithm  = JwtAlgorithm.fromString(config.getString("jwt.algorithm")) match {
    case e: JwtHmacAlgorithm => e
    case _                   => throw new IllegalArgumentException("Expected a HMAC algorithm")
  }
  private val authSessionTimeout: Duration    = config.getDuration("jwt.timeout")
  private val refreshSessionTimeout: Duration = config.getDuration("jwt.refreshTimeout")

  private given Configuration = Configuration.default
    .withDiscriminator("typ")
    .withTransformConstructorNames {
      case "Authenticated" => TokenType.Access.id
      case "RefreshToken"  => TokenType.Refresh.id
    }

  sealed trait TokenSpec[T <: Session] {
    def expected: TokenType
    def secret: String
    def timeout: Duration
    def encoder: Encoder.AsObject[T]
    def decoder: Decoder[T]
  }

  object TokenSpec {
    given TokenSpec[Authenticated] with {
      val expected: TokenType                      = TokenType.Access
      val secret: String                           = jwtAccessTokenSecret
      val timeout: Duration                        = authSessionTimeout
      val encoder: Encoder.AsObject[Authenticated] = ConfiguredEncoder.derived[Authenticated]
      val decoder: Decoder[Authenticated]          = ConfiguredDecoder.derived[Authenticated]
    }

    given TokenSpec[RefreshToken] with
      val expected: TokenType                     = TokenType.Refresh
      val secret: String                          = jwtRefreshTokenSecret
      val timeout: Duration                       = refreshSessionTimeout
      val encoder: Encoder.AsObject[RefreshToken] = ConfiguredEncoder.derived[RefreshToken]
      val decoder: Decoder[RefreshToken]          = ConfiguredDecoder.derived[RefreshToken]
  }

  sealed abstract class TokenType(val id: String)

  object TokenType {
    case object Access  extends TokenType("access")
    case object Refresh extends TokenType("refresh")
  }

  private def fromJwt[T <: Session](jwt: String)(using spec: TokenSpec[T]): Option[T] =
    for {
      claim <- JwtCirce.decode(jwt, spec.secret, Seq(jwtAlgorithm)).toOption
      json  <- parse(claim.content).toOption
      typ   <- json.hcursor.get[String]("typ").toOption
      if typ == spec.expected.id
      typed <- json.as(using spec.decoder).toOption
    } yield typed

  private def toJwt[T <: Session](session: T)(using spec: TokenSpec[T]): String = {
    val now = Instant.now()

    val claim = JwtClaim(
      content = spec.encoder.encodeObject(session).add("typ", Json.fromString(spec.expected.id)).asJson.noSpaces,
      expiration = Some(now.plus(spec.timeout).getEpochSecond),
      issuedAt = Some(now.getEpochSecond)
    )

    JwtCirce.encode(claim, spec.secret, jwtAlgorithm)
  }

  /**
   * @param username
   *   the verified username of the user
   * @param permissions
   *   the 'snapshot' of permissions, not to be 100% trusted as permissions can be revoked between issuing and usage
   */
  case class Authenticated(username: String, permissions: List[String]) extends Session {
    def toJwt: String = Session.toJwt(this)
  }

  object Authenticated {
    def fromJwt(jwt: String): Option[Authenticated] = Session.fromJwt[Authenticated](jwt)
  }

  case class RefreshToken(username: String) extends Session {
    def toJwt: String = Session.toJwt(this)
  }

  object RefreshToken {
    def fromJwt(jwt: String): Option[RefreshToken] = Session.fromJwt[RefreshToken](jwt)
  }
}
