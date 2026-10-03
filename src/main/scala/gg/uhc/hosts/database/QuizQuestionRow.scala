package gg.uhc.hosts.database

import java.time.Instant

import gg.uhc.hosts.endpoints.hostapplications.QuestionType

case class QuizQuestionRow(id: Long, prompt: String, questionType: QuestionType, createdBy: String, created: Instant)
