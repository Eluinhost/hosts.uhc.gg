package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.{Directive0, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, QuizQuestionRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

import java.time.Instant

class CreateQuizQuestion(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class ChoicePayload(text: String, correct: Boolean)
  case class CreateQuizQuestionPayload(prompt: String, questionType: String, choices: List[ChoicePayload])

  private[this] val validTypes = Set("multiple choice", "text")

  private[this] def validatePayload(payload: CreateQuizQuestionPayload): Directive0 =
    validate(payload.prompt.trim.nonEmpty, "Prompt cannot be empty") &
      validate(validTypes.contains(payload.questionType), "Invalid question type") &
      validate(payload.choices.forall(_.text.trim.nonEmpty), "Choices cannot be empty") &
      validate(
        payload.questionType != "multiple choice" || (payload.choices.size >= 2 && payload.choices.count(_.correct) == 1),
        "Multiple choice questions require at least 2 choices with exactly one correct answer"
      ) &
      validate(payload.questionType != "text" || payload.choices.isEmpty, "Text questions cannot have choices")

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          entity(as[CreateQuizQuestionPayload]) { payload =>
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
                complete(StatusCodes.Created -> Map("id" -> id))
              }
            }
          }
        }
      }
    }
}
