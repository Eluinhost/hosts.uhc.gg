package gg.uhc.hosts.database

import java.time.Instant

case class QuizQuestionRow(id: Long, prompt: String, questionType: String, createdBy: String, created: Instant)
