package gg.uhc.hosts.database

case class HostApplicationAnswerRow(
    id: Long,
    applicationId: Long,
    questionPrompt: String,
    questionType: String,
    choiceText: Option[String],
    choiceCorrect: Option[Boolean],
    textAnswer: Option[String])
