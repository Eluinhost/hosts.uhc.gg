package gg.uhc.hosts.database

import gg.uhc.hosts.endpoints.hostapplications.QuestionType

import java.time.Instant

case class QuizQuestionRow(id: Long, prompt: String, questionType: QuestionType, createdBy: String, created: Instant)
