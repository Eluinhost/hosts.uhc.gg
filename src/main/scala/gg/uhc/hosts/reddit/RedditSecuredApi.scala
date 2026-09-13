package gg.uhc.hosts.reddit

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.http.scaladsl.model.headers.{Authorization, OAuth2BearerToken}
import org.apache.pekko.http.scaladsl.model.{HttpMethods, HttpRequest, StatusCodes}
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import io.circe.generic.AutoDerivation
import org.mdedetrich.pekko.http.support.CirceHttpSupport

import scala.concurrent.Future

class RedditSecuredApi(actorSystem: ActorSystem, queueSize: Int)
    extends ApiConsumer(actorSystem, "oauth.reddit.com", queueSize)
    with CirceHttpSupport
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
