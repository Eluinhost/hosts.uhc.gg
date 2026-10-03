package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.server.Directives.*
import org.apache.pekko.http.scaladsl.server.PathMatchers.LongNumber
import org.apache.pekko.http.scaladsl.server.Route

class QuizRoute(
    getQuizQuestions: GetQuizQuestions,
    createQuizQuestion: CreateQuizQuestion,
    deleteQuizQuestion: DeleteQuizQuestion
               ) {
  def apply(): Route =
    concat(
      (get & pathEndOrSingleSlash)(getQuizQuestions()),
      (post & pathEndOrSingleSlash)(createQuizQuestion()),
      (delete & path(LongNumber))(deleteQuizQuestion(_))
    )
}
