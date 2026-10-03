package gg.uhc.hosts.endpoints.hostapplications

import java.time.Instant

import org.apache.pekko.http.scaladsl.server.{Directive1, Route}
import org.apache.pekko.http.scaladsl.server.Directives.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.authentication.Session
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class GetQuizQuestions(database: Database, customDirectives: CustomDirectives) {

  import CustomJsonCodec.*
  import customDirectives.*

  private case class MetaData(createdBy: String, created: Instant)

  private case class Choice(id: Long, text: String, correct: Option[Boolean])

  private case class Question(
                               id: Long,
                               prompt: String,
                               questionType: QuestionType,
                               choices: List[Choice],
                               metadata: Option[MetaData]
                             )

  private def checkCanSeeMetadata: Directive1[Boolean] =
    optionalAuthentication.flatMap {
      case Some(session) =>
        requireSucessfulQuery(database.getPermissions(session.username)).map(_.contains("hosting advisor"))
      case None => provide(false)
    }

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      checkCanSeeMetadata { canSeeMetadata =>
        requireSucessfulQuery(database.getAllQuizQuestions) { questions =>
          requireSucessfulQuery(database.getQuizQuestionChoices(questions.map(_.id))) { choices =>
            val choicesByQuestion = choices.groupBy(_.questionId)

            val result = questions.map { question =>
              Question(
                id = question.id,
                prompt = question.prompt,
                questionType = question.questionType,
                choices = choicesByQuestion.getOrElse(question.id, Nil).map(c =>
                  Choice(
                    id = c.id,
                    text = c.text,
                    correct = Option.when(canSeeMetadata) {
                      c.correct
                    }
                  )
                ),
                metadata = Option.when(canSeeMetadata) {
                  MetaData(createdBy = question.createdBy, created = question.created)
                }
              )
            }
            complete(result)
          }
        }
      }
    }
}
