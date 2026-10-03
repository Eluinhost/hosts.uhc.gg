package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.{Directive0, Directive1, Route}
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.{
  Database,
  HostApplicationAnswerRow,
  HostApplicationRow,
  QuizQuestionChoiceRow,
  QuizQuestionRow
}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class CreateHostApplication(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  private case class AnswerPayload(questionId: Long, answer: String)

  private case class CreateHostApplicationPayload(answers: List[AnswerPayload])

  private def validateApplicant(username: String): Directive0 =
    requireSucessfulQuery(database.getPermissions(username)).flatMap { (permissions: List[String]) =>
      validate(
        !permissions.contains("host") && !permissions.contains("trial host"),
        "Hosts cannot submit applications"
      ) & validate(!permissions.contains("hosting banned"), "Banned users cannot submit applications")
    } & requireSucessfulQuery(database.getPendingHostApplicationForUsername(username)).flatMap {
      (existing: Option[HostApplicationRow]) =>
        validate(existing.isEmpty, "You already have a pending application")
    }

  private def validateQuestionAnswered(
                                        question: QuizQuestionRow,
                                        choices: List[QuizQuestionChoiceRow],
                                        answer: String
                                      ): Either[String, HostApplicationAnswerRow] =
    question.questionType match {
      case QuestionType.TEXT =>
        Either.cond(
          answer.trim.nonEmpty,
          HostApplicationAnswerRow(
            id = -1,
            applicationId = -1,
            questionPrompt = question.prompt,
            questionType = question.questionType,
            answer = answer.trim,
            choiceCorrect = None
          ),
          s"""You must answer question: "${question.prompt}""""
        )
      case QuestionType.MULTIPLE_CHOICE =>
        choices
          .find(_.text == answer)
          .map(
            option =>
              HostApplicationAnswerRow(
                id = -1,
                applicationId = -1,
                questionPrompt = question.prompt,
                questionType = question.questionType,
                answer = option.text,
                choiceCorrect = Some(option.correct)
              ))
          .toRight(s"""Invalid choice for question: "${question.prompt}"""")
    }

  private def validateEachQuestionAnswered(
                                            questions: List[QuizQuestionRow],
                                            choices: List[QuizQuestionChoiceRow],
                                            answers: List[AnswerPayload]
                                          ): Directive1[List[HostApplicationAnswerRow]] = {
    val choicesByQuestionId = choices.groupBy(_.questionId)
    val answersByQuestionId = answers.groupBy(_.questionId).view.mapValues(_.head.answer).toMap

    // no need to check for excess answers without a matching question as we're looping the questions, and they'll just
    // get silently removed from the outputs
    val results: List[Either[String, HostApplicationAnswerRow]] =
      questions.map { question =>
        answersByQuestionId
          .get(question.id)
          .map(answer => validateQuestionAnswered(
            question = question,
            answer = answer,
            choices = choicesByQuestionId.getOrElse(question.id, Nil)
          ))
          .getOrElse(Left(s"""You must answer question: "${question.prompt}""""))
      }

    // if there are any errors in the list, collect them all and make that the full error message
    // otherwise pass the generated rows to the route
    validate(results.forall(_.isRight), results.collect { case Left(msg) => msg }.mkString(", ")) & {
      provide(results.collect { case Right(row) => row })
    }
  }

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        validateApplicant(session.username) {
          entity(as[CreateHostApplicationPayload]) { payload =>
            requireSucessfulQuery(database.getAllQuizQuestions) { questions =>
              requireSucessfulQuery(database.getQuizQuestionChoices(questions.map(_.id))) { choices =>
                validateEachQuestionAnswered(questions, choices, payload.answers) { answerRows =>
                  requireSucessfulQuery(database.submitHostApplication(session.username, answerRows)) { id =>
                    complete(StatusCodes.Created, Map("id" -> id))
                  }
                }
              }
            }
          }
        }
      }
    }
}
