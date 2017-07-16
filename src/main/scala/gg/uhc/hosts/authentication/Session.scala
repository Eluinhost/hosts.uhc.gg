package gg.uhc.hosts.authentication

import java.time.{Duration, Instant}

import com.typesafe.config.ConfigFactory
import gg.uhc.hosts.CustomJsonCodec._
import io.circe.Json
import io.circe.parser.parse
import io.circe.syntax._
import pdi.jwt.algorithms.JwtHmacAlgorithm
import pdi.jwt.{JwtAlgorithm, JwtCirce, JwtClaim}

sealed trait Session {
  def toJwt: String
}

object Session {
  private[this] val config = ConfigFactory.load()
  private[this] val jwtSecret: String    = config.getString("jwt.secret")
  private[this] val jwtAlgorithm: JwtHmacAlgorithm = JwtAlgorithm.fromString(config.getString("jwt.algorithm")) match {
    case e: JwtHmacAlgorithm ⇒ e
    case _                   ⇒ throw new IllegalArgumentException("Expected a HMAC algorithm")
  }
  private[this] val authSessionTimeout: Duration    = config.getDuration("jwt.timeout")
  private[this] val refreshSessionTimeout: Duration = config.getDuration("jwt.refreshTimeout")

  private[this] def generateJwtToken(content: String, timeout: Duration) = {
    val now = Instant.now()

    val claim = JwtClaim (
      content = content,
      expiration = Some(now.plus(timeout).getEpochSecond),
      issuedAt = Some(now.getEpochSecond)
    )

    JwtCirce.encode(claim, jwtSecret, jwtAlgorithm)
  }

  private[this] def parseTokenContents(jwt: String): Option[Json] =
    for {
      claim ← JwtCirce.decode(jwt, jwtSecret, Seq(jwtAlgorithm)).toOption
      json  ← parse(claim.content).toOption
    } yield json

  /**
    * @param username the verified username of the user
    * @param permissions the 'snapshot' of permissions, not to be 100% trusted as permissions can be revoked between
    *                    issuing and usage
    */
  case class Authenticated(username: String, permissions: List[String]) extends Session {
    override def toJwt: String = generateJwtToken(this.asJson.noSpaces, authSessionTimeout)
  }

  object Authenticated {
    def fromJwt(jwt: String): Option[Authenticated] =
      parseTokenContents(jwt).flatMap(_.as[Authenticated].toOption)
  }

  case class RefreshToken(username: String) extends Session {
    override def toJwt: String = generateJwtToken(this.asJson.noSpaces, refreshSessionTimeout)
  }

  object RefreshToken {
    def fromJwt(jwt: String): Option[RefreshToken] =
      parseTokenContents(jwt).flatMap(_.as[RefreshToken].toOption)
  }
}
