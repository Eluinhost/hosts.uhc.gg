package gg.uhc.hosts.database

import gg.uhc.hosts.endpoints.hostapplications.QuestionType

case class HostApplicationAnswerRow(
    id: Long,
    applicationId: Long,
    questionPrompt: String,
    questionType: QuestionType,
    answer: String,
    choiceCorrect: Option[Boolean]
                                   )
