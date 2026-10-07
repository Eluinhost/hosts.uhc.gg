package gg.uhc.hosts.endpoints.hostapplications

import java.time.Instant

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.{Directive0, Route}
import org.apache.pekko.http.scaladsl.server.Directives.*
import io.circe.{Codec, Decoder}
import io.circe.derivation.{Configuration, ConfiguredDecoder}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, QuizQuestionRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class CreateQuizQuestion(database: Database, customDirectives: CustomDirectives) {

  import CustomJsonCodec.*
  import customDirectives.*

  private case class Choice(text: String, correct: Boolean)

  private case class QuestionPayload(prompt: String, questionType: QuestionType, choices: List[Choice])

  private def validatePayload(payload: QuestionPayload): Directive0 =
    validate(payload.prompt.trim.nonEmpty, "Prompt cannot be empty") &
      validate(payload.prompt.trim.length >= 5, "Prompt must be at least 5 characters") &
      (payload.questionType match {
        case QuestionType.MULTIPLE_CHOICE =>
          validate(
            payload.choices.nonEmpty && payload.choices.forall(_.text.trim.nonEmpty),
            "Choices cannot be empty"
          ) &
            validate(payload.choices.size >= 2, "Multiple choice questions require at least 2 choices") &
            validate(
              payload.choices.count(_.correct) == 1,
              "Multiple choice questions require exactly one correct answer"
            )
        case QuestionType.TEXT            =>
          validate(payload.choices.isEmpty, "Text questions cannot have choices")
      })

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          entity(as[QuestionPayload]) { payload =>
            validatePayload(payload) {
              val question = QuizQuestionRow(
                id = -1,
                prompt = payload.prompt.trim,
                questionType = payload.questionType,
                createdBy = session.username,
                created = Instant.now()
              )

              val choices = payload.choices.map(c => c.text.trim -> c.correct)

              requireSucessfulQuery(database.createQuizQuestionWithChoices(question, choices)) { id =>
                complete(StatusCodes.Created, Map("id" -> id))
              }
            }
          }
        }
      }
    }
}
