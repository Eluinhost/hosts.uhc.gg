package gg.uhc.hosts.reddit

import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.{Authorization, BasicHttpCredentials}
import akka.http.scaladsl.unmarshalling.Unmarshal
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport

import scala.concurrent.Future

class RedditAuthenticationApi(clientId: String, secret: String, redirectUri: String, queueSize: Int)
    extends ApiConsumer("reddit-authentication-api", "www.reddit.com", queueSize)
    with FailFastCirceSupport {
  import io.circe.generic.auto._

  def startAuthFlowUrl(state: String) =
    s"https://www.reddit.com/api/v1/authorize?client_id=$clientId&response_type=code&state=$state&redirect_uri=$redirectUri&duration=temporary&scope=identity"

  // Create the client header used when querying for access tokens
  val clientCredentialsHeader = Authorization(
    credentials = BasicHttpCredentials(
      username = clientId,
      password = secret
    )
  )

  def getAccessToken(authCode: String): Future[AccessTokenResponse] = {
    // build the request
    val request = HttpRequest(
      uri = s"/api/v1/access_token",
      method = HttpMethods.POST,
      headers = clientCredentialsHeader :: Nil,
      entity = FormData(
        "code"         -> authCode,
        "grant_type"   -> "authorization_code",
        "redirect_uri" -> redirectUri
      ).toEntity
    )

    actorSystem.log.debug(s"Fetching access token from auth code $authCode, request $request")

    for {
      response <- queueRequest(request)
      if response.status == StatusCodes.OK
      parsed <- Unmarshal(response).to[AccessTokenResponse]
    } yield parsed
  }
}
