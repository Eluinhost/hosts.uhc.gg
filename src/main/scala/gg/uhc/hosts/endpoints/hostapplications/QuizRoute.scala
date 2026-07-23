package gg.uhc.hosts.endpoints.hostapplications

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.PathMatchers.LongNumber
import akka.http.scaladsl.server.Route

class QuizRoute(
    getQuizQuestions: GetQuizQuestions,
    getQuizQuestionsForManagement: GetQuizQuestionsForManagement,
    createQuizQuestion: CreateQuizQuestion,
    deleteQuizQuestion: DeleteQuizQuestion) {
  def apply(): Route =
    concat(
      (get & path("manage"))(getQuizQuestionsForManagement()),
      (get & pathEndOrSingleSlash)(getQuizQuestions()),
      (post & pathEndOrSingleSlash)(createQuizQuestion()),
      (delete & path(LongNumber))(deleteQuizQuestion(_))
    )
}
