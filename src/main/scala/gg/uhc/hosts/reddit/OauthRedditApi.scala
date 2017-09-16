package gg.uhc.hosts.reddit

import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

import akka.http.scaladsl.model.headers.{Authorization, OAuth2BearerToken}
import akka.http.scaladsl.model.{FormData, HttpMethods, HttpRequest, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal
import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import gg.uhc.hosts.database.MatchRow
import io.circe.generic.AutoDerivation

import scala.concurrent.Future

class OauthRedditApi(discussionSubreddit: String, queueSize: Int)
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
      response ← queueRequest(request)
      if response.status == StatusCodes.OK
      parsed ← Unmarshal(response).to[MeResponse]
    } yield parsed.name
  }

  def createDiscussionThread(m: MatchRow, baseUrl: String, accessToken: String): Future[String] = {
    // TODO set flairs?

    val request = HttpRequest(
      uri = s"/api/submit",
      method = HttpMethods.POST,
      headers = Authorization(OAuth2BearerToken(accessToken)) :: Nil,
      entity = FormData(
        "api_type"    → "json",
        "extension"   → "json",
        "kind"        → "self",
        "sendreplies" → "false",
        "sr"          → discussionSubreddit,
        "text"        → s"[More information can be found here]($baseUrl/m/${m.id})",
        "title"       → s"${m.legacyTitle()}"
      ).toEntity
    )

    for {
      response ← queueRequest(request)
      if response.status == StatusCodes.OK
      data ← Unmarshal(response).to[SubmitResponse]
    } yield data.json.data.id
  }
}
