package gg.uhc.hosts.reddit

import akka.http.scaladsl.model.headers.{Authorization, OAuth2BearerToken}
import akka.http.scaladsl.model.{HttpMethods, HttpRequest, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import io.circe.generic.AutoDerivation

import scala.concurrent.Future

class RedditSecuredApi(queueSize: Int)
    extends ApiConsumer("reddit-secured-api", "oauth.reddit.com", queueSize)
    with FailFastCirceSupport
    with AutoDerivation {

  def getUsername(accessToken: String): Future[String] = {
    val request = HttpRequest(
      uri = s"/api/v1/me",
      method = HttpMethods.GET,
      headers = Authorization(OAuth2BearerToken(accessToken)) :: Nil
    )

    actorSystem.log.debug(s"Fetching username using access token $accessToken, request $request")

    for {
      response <- queueRequest(request)
      if response.status == StatusCodes.OK
      parsed <- Unmarshal(response).to[MeResponse]
    } yield parsed.name
  }
}
