package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

import java.time.Instant

class GetQuizQuestionsForManagement(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class ManageChoice(id: Long, text: String, correct: Boolean)
  case class ManageQuestion(
      id: Long,
      prompt: String,
      questionType: String,
      createdBy: String,
      created: Instant,
      choices: List[ManageChoice])

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          requireSucessfulQuery(database.getAllQuizQuestions) { questions =>
            requireSucessfulQuery(database.getQuizQuestionChoices(questions.map(_.id))) { choices =>
              val choicesByQuestion = choices.groupBy(_.questionId)
              val result = questions.map { question =>
                ManageQuestion(
                  id = question.id,
                  prompt = question.prompt,
                  questionType = question.questionType,
                  createdBy = question.createdBy,
                  created = question.created,
                  choices = choicesByQuestion
                    .getOrElse(question.id, Nil)
                    .map(c => ManageChoice(c.id, c.text, c.correct))
                )
              }
              complete(result)
            }
          }
        }
      }
    }
}
