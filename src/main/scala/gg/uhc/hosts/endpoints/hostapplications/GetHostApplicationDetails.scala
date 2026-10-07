package gg.uhc.hosts.endpoints.hostapplications

import java.time.Instant

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetHostApplicationDetails(database: Database, customDirectives: CustomDirectives) {

  import CustomJsonCodec.*
  import customDirectives.*

  private case class AnswerResponse(
      prompt: String,
      answer: String,
      questionType: QuestionType,
      choiceCorrect: Option[Boolean]
  )

  private case class HostApplicationDetailsResponse(
      id: Long,
      username: String,
      created: Instant,
      status: String,
      reviewedBy: Option[String],
      reviewedAt: Option[Instant],
      reviewReason: Option[String],
      answers: List[AnswerResponse]
  )

  def apply(id: Long): Route =
    handleRejections(EndpointRejectionHandler()) {
      optionalAuthentication { session =>
        val canReview = session.exists(_.permissions.contains("hosting advisor"))

        requireSucessfulQuery(database.getHostApplication(id)) {
          case None              => complete(StatusCodes.NotFound)
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
                  answers = answers.map(answer =>
                    AnswerResponse(
                      prompt = answer.questionPrompt,
                      answer = answer.answer,
                      questionType = answer.questionType,
                      choiceCorrect = if canReview then answer.choiceCorrect else None,
                    )
                  )
                )
              )
            }
        }
      }
    }
}
