package gg.uhc.hosts

import java.time.{Duration, Instant}

import akka.http.scaladsl.model.headers._
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive1}
import akka.http.scaladsl.server.Directives._
import com.typesafe.config.ConfigFactory
import io.circe.parser.parse
import pdi.jwt.algorithms.JwtHmacAlgorithm
import pdi.jwt.{JwtAlgorithm, JwtCirce, JwtClaim}
import io.circe.syntax._
import CustomJsonCodec._

case class Session(username: String, permissions: List[String]) {
  def toJwt: String = {
    val now = Instant.now()

    val claim = JwtClaim(
      content = this.asJson.noSpaces,
      expiration = Some(now.plus(Session.jwtTimeout).getEpochSecond),
      issuedAt = Some(now.getEpochSecond)
    )

    JwtCirce.encode(claim, Session.jwtSecret, Session.jwtAlgorithm)
  }
}

object Session {
  private[this] val config = ConfigFactory.load()
  val jwtSecret: String    = config.getString("jwt.secret")
  val jwtAlgorithm: JwtHmacAlgorithm = JwtAlgorithm.fromString(config.getString("jwt.algorithm")) match {
    case e: JwtHmacAlgorithm ⇒ e
    case _                   ⇒ throw new IllegalArgumentException("Expected a HMAC algorithm")
  }
  val jwtTimeout: Duration = config.getDuration("jwt.timeout")

  def fromJwt(token: String): Option[Session] =
    (for {
      claim   ← JwtCirce.decode(token, jwtSecret, Seq(jwtAlgorithm)).toEither.right
      json    ← parse(claim.content).right
      session ← json.as[Session].right
    } yield session).toOption

  val optionalSession: Directive1[Option[Session]] =
    optionalHeaderValuePF {
      case Authorization(OAuth2BearerToken(token)) ⇒ token
    }.flatMap(maybeToken ⇒ provide(maybeToken.flatMap(fromJwt)))

  /**
    * Rejects with authentication failed reject if header missing or invalid JWT token
    */
  val requireValidSession: Directive1[Session] =
    optionalSession.flatMap {
      case Some(token) ⇒
        provide(token)
      case None ⇒
        reject(
          AuthenticationFailedRejection(
            AuthenticationFailedRejection.CredentialsMissing,
            HttpChallenges.basic("login")
          )
        )
    }
}
