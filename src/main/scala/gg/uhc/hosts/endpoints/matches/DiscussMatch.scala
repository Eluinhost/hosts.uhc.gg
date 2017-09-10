package gg.uhc.hosts.endpoints.matches

import java.time.Instant
import java.time.temporal.ChronoUnit

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Directive1, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, MatchRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import gg.uhc.hosts.reddit.{OauthRedditApi, WwwRedditApi}

import scala.util.{Failure, Success}

class DiscussMatch(
    directives: CustomDirectives,
    database: Database,
    oauthRedditApi: OauthRedditApi,
    wwwRedditApi: WwwRedditApi) {
  import CustomJsonCodec._
  import directives._

  private[this] def withAccessToken: Directive1[String] =
    wwwRedditApi.botAccessToken
      .map(provide)
      .getOrElse(complete(StatusCodes.FailedDependency))

  private[this] def generateNewThread(m: MatchRow): Directive1[String] =
    withAccessToken.flatMap { token ⇒
      extractHost.flatMap { host ⇒
        extractScheme.flatMap { scheme ⇒
          onComplete(oauthRedditApi.createDiscussionThread(m, s"$scheme://$host", token)).flatMap {
            case Success(threadId) ⇒
              provide(threadId)
            case Failure(_) ⇒
              complete(StatusCodes.BadGateway)
          }
        }
      }
    }

  private[this] def grabThreadId(m: MatchRow): Directive1[String] =
    m.redditThreadId
      .map(provide) // if it's already defined just return it
      .getOrElse {
        if (m.opens.isBefore(Instant.now().minus(3, ChronoUnit.DAYS))) {
          complete(StatusCodes.BadRequest → "match too old to start discussion thread")
        } else {
          generateNewThread(m).flatMap { threadId ⇒
            requireSucessfulQuery(database.updateRedditThreadId(m.id, threadId)).flatMap { _ ⇒
              provide(threadId)
            }
          }
        }
      }

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.matchById(id)) {
        case None ⇒
          complete(StatusCodes.NotFound)
        case Some(row) ⇒
          grabThreadId(row) { threadId ⇒
            complete(threadId)
          }
      }
    }
}
