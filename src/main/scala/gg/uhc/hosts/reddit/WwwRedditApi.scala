package gg.uhc.hosts.reddit

import java.util.NoSuchElementException

import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.{Authorization, BasicHttpCredentials}
import akka.http.scaladsl.unmarshalling.Unmarshal
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport

import scala.concurrent.Future
import scala.concurrent.duration.FiniteDuration
import scala.concurrent.duration._
import scala.language.postfixOps

class WwwRedditApi(
    oauthClientId: String,
    oauthClientSecret: String,
    redirectUri: String,
    queueSize: Int,
    botClientId: String,
    botClientSecret: String,
    botUsername: String,
    botPassword: String)
    extends ApiConsumer("reddit-authentication-api", "www.reddit.com", queueSize)
    with FailFastCirceSupport {
  import io.circe.generic.auto._

  def startAuthFlowUrl(state: String) =
    s"https://www.reddit.com/api/v1/authorize?client_id=$oauthClientId&response_type=code&state=$state&redirect_uri=$redirectUri&duration=temporary&scope=identity"

  // client header used when querying for users access tokens
  private[this] val oauthClientCredentials = Authorization(
    credentials = BasicHttpCredentials(
      username = oauthClientId,
      password = oauthClientSecret
    )
  )

  // client header used when querying for bot access tokens
  private[this] val botClientCredentials = Authorization(
    credentials = BasicHttpCredentials(
      username = botClientId,
      password = botClientSecret
    )
  )

  var botAccessToken: Option[String] = None
  repeatingBotTokenUpdates()

  /**
    * Gets an access token for an oauth user
    * @param authCode the auth code from oauth flow
    */
  def getAccessToken(authCode: String): Future[AccessTokenResponse] = {
    // build the request
    val request = HttpRequest(
      uri = s"/api/v1/access_token",
      method = HttpMethods.POST,
      headers = oauthClientCredentials :: Nil,
      entity = FormData(
        "code"         → authCode,
        "grant_type"   → "authorization_code",
        "redirect_uri" → redirectUri
      ).toEntity
    )

    actorSystem.log.debug(s"Fetching access token from auth code $authCode, request $request")

    for {
      response ← queueRequest(request)
      if response.status == StatusCodes.OK
      parsed ← Unmarshal(response).to[AccessTokenResponse]
    } yield parsed
  }

  private[this] def getBotAccessToken: Future[String] = {
    actorSystem.log.info(s"Fetching access token for $botUsername")

    // build the request
    val request = HttpRequest(
      uri = s"/api/v1/access_token",
      method = HttpMethods.POST,
      headers = botClientCredentials :: Nil,
      entity = FormData(
        "grant_type" → "password",
        "username"   → botUsername,
        "password"   → botPassword
      ).toEntity
    )

    for {
      response ← queueRequest(request)
      _ ←
        if (response.status == StatusCodes.OK) {
          Future.successful(Unit)
        } else {
          actorSystem.log.debug(response.toString())
          Future.failed(new NoSuchElementException("status was not OK"))
        }
      parsed ← Unmarshal(response).to[AccessTokenResponse]
      _ = actorSystem.log.info(s"Found new bot token: ${parsed.access_token}")
    } yield parsed.access_token
  }

  // updates now, then every 30 minutes unless an error occurs in which case after 1 minute
  private[this] def repeatingBotTokenUpdates(
      successDelay: FiniteDuration = 30 minutes,
      errorDelay: FiniteDuration = 1 minute
    ): Unit =
    getBotAccessToken
      .map { token ⇒
        botAccessToken = Some(token)
        actorSystem.scheduler.scheduleOnce(successDelay)(repeatingBotTokenUpdates(successDelay, errorDelay))
      }
      .failed
      .map { error ⇒
        actorSystem.log.error(error, "failed to lookup bot access token")
        actorSystem.scheduler.scheduleOnce(errorDelay)(repeatingBotTokenUpdates(successDelay, errorDelay))
      }
}
