package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.{Directive0, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{Database, HostApplicationAnswerRow, HostApplicationRow, QuizQuestionChoiceRow, QuizQuestionRow}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import io.circe.syntax.EncoderOps

class CreateHostApplication(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class AnswerPayload(questionId: Long, choiceId: Option[Long], textAnswer: Option[String])
  case class CreateHostApplicationPayload(answers: List[AnswerPayload])

  private[this] def validateApplicant(username: String): Directive0 =
    requireSucessfulQuery(database.getPermissions(username)).flatMap { (permissions: List[String]) =>
      validate(
        !permissions.contains("host") && !permissions.contains("trial host"),
        "Hosts cannot submit applications"
      ) & validate(!permissions.contains("hosting banned"), "Banned users cannot submit applications")
    } & requireSucessfulQuery(database.getPendingHostApplicationForUsername(username)).flatMap {
      (existing: Option[HostApplicationRow]) =>
        validate(existing.isEmpty, "You already have a pending application")
    }

  private[this] def buildAnswers(
      payload: List[AnswerPayload],
      questions: List[QuizQuestionRow],
      choices: List[QuizQuestionChoiceRow]
  ): Either[String, List[HostApplicationAnswerRow]] =
    if (questions.isEmpty) {
      Left("There are no quiz questions configured")
    } else if (payload.map(_.questionId).distinct.size != questions.size || payload.size != questions.size) {
      Left("You must answer every question exactly once")
    } else {
      val choicesByQuestion = choices.groupBy(_.questionId)
      val answersByQuestion = payload.map(a => a.questionId -> a).toMap

      questions.foldLeft[Either[String, List[HostApplicationAnswerRow]]](Right(Nil)) { (acc, question) =>
        acc.flatMap { built =>
          answersByQuestion.get(question.id) match {
            case Some(answer) if question.questionType == "text" =>
              answer.textAnswer.map(_.trim).filter(_.nonEmpty) match {
                case Some(text) =>
                  Right(
                    built :+ HostApplicationAnswerRow(
                      id = -1,
                      applicationId = -1,
                      questionPrompt = question.prompt,
                      questionType = question.questionType,
                      choiceText = None,
                      choiceCorrect = None,
                      textAnswer = Some(text)
                    ))
                case None => Left(s"Missing answer for question: ${question.prompt}")
              }
            case Some(answer) if question.questionType == "multiple choice" =>
              answer.choiceId.flatMap(id => choicesByQuestion.getOrElse(question.id, Nil).find(_.id == id)) match {
                case Some(choice) =>
                  Right(
                    built :+ HostApplicationAnswerRow(
                      id = -1,
                      applicationId = -1,
                      questionPrompt = question.prompt,
                      questionType = question.questionType,
                      choiceText = Some(choice.text),
                      choiceCorrect = Some(choice.correct),
                      textAnswer = None
                    ))
                case None => Left(s"Invalid choice for question: ${question.prompt}")
              }
            case _ => Left(s"Missing answer for question: ${question.prompt}")
          }
        }
      }
    }

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        validateApplicant(session.username) {
          entity(as[CreateHostApplicationPayload]) { payload =>
            requireSucessfulQuery(database.getAllQuizQuestions) { questions =>
              requireSucessfulQuery(database.getQuizQuestionChoices(questions.map(_.id))) { choices =>
                buildAnswers(payload.answers, questions, choices) match {
                  case Left(error) => complete(StatusCodes.BadRequest -> error)
                  case Right(answers) =>
                    requireSucessfulQuery(database.submitHostApplication(session.username, answers)) { id =>
                      complete(StatusCodes.Created, Map("id" -> id).asJson)
                    }
                }
              }
            }
          }
        }
      }
    }
}
