package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

import java.time.Instant

class GetHostApplicationDetails(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class AnswerResponse(
      questionPrompt: String,
      questionType: String,
      choiceText: Option[String],
      choiceCorrect: Option[Boolean],
      textAnswer: Option[String])

  case class HostApplicationDetailsResponse(
      id: Long,
      username: String,
      created: Instant,
      status: String,
      reviewedBy: Option[String],
      reviewedAt: Option[Instant],
      reviewReason: Option[String],
      answers: List[AnswerResponse])

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      optionalAuthentication { session =>
        val canReview = session.exists(_.permissions.contains("hosting advisor"))

        requireSucessfulQuery(database.getHostApplication(id)) {
          case None => complete(StatusCodes.NotFound)
          case Some(application) =>
            requireSucessfulQuery(database.getHostApplicationAnswers(id)) { answers =>
              complete(
                HostApplicationDetailsResponse(
                  id = application.id,
                  username = application.username,
                  created = application.created,
                  status = application.status,
                  reviewedBy = application.reviewedBy,
                  reviewedAt = application.reviewedAt,
                  reviewReason = application.reviewReason,
                  answers = answers.map(
                    answer =>
                      AnswerResponse(
                        questionPrompt = answer.questionPrompt,
                        questionType = answer.questionType,
                        choiceText = answer.choiceText,
                        choiceCorrect = if (canReview) answer.choiceCorrect else None,
                        textAnswer = answer.textAnswer
                    ))
                )
              )
            }
        }
      }
    }
}
