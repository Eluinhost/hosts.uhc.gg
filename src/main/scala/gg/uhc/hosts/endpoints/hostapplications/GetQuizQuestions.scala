package gg.uhc.hosts.endpoints.hostapplications

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetQuizQuestions(database: Database, customDirectives: CustomDirectives) {
  import CustomJsonCodec._
  import customDirectives._

  case class PublicChoice(id: Long, text: String)
  case class PublicQuestion(id: Long, prompt: String, questionType: String, choices: List[PublicChoice])

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSucessfulQuery(database.getAllQuizQuestions) { questions =>
        requireSucessfulQuery(database.getQuizQuestionChoices(questions.map(_.id))) { choices =>
          val choicesByQuestion = choices.groupBy(_.questionId)
          val result = questions.map { question =>
            PublicQuestion(
              id = question.id,
              prompt = question.prompt,
              questionType = question.questionType,
              choices = choicesByQuestion.getOrElse(question.id, Nil).map(c => PublicChoice(c.id, c.text))
            )
          }
          complete(result)
        }
      }
    }
}
