package gg.uhc.hosts.endpoints.hostapplications

import doobie.enumerated.JdbcType
import doobie.util.meta.Meta
import io.circe.{Decoder, DecodingFailure, Encoder}
import io.circe.DecodingFailure.Reason.CustomReason

enum QuestionType(val id: String) {
  case MULTIPLE_CHOICE extends QuestionType("multiple choice")
  case TEXT            extends QuestionType("text")
}

object QuestionType {
  def fromId(id: String): Either[String, QuestionType] =
    values.find(_.id == id).toRight(s"$id is not a valid question type")

  given Meta[QuestionType] =
    Meta.Basic.one[QuestionType](
      JdbcType.VarChar,
      List(JdbcType.Char, JdbcType.LongVarChar, JdbcType.NChar, JdbcType.NVarChar, JdbcType.LongnVarChar),
      get = (rs, n) => fromId(rs.getString(n)).fold(msg => throw new IllegalArgumentException(msg), identity),
      put = (ps, n, q) => ps.setString(n, q.id),
      update = (rs, n, q) => rs.updateString(n, q.id)
    )

  implicit val encoder: Encoder[QuestionType] = Encoder.instance(questionType => Encoder[String].apply(questionType.id))
  implicit val decoder: Decoder[QuestionType] = Decoder.instance(cursor =>
    cursor.as[String].flatMap { str =>
      fromId(str) match
        case Left(msg) => Left(DecodingFailure(CustomReason(msg), cursor))
        case Right(q)  => Right(q)
    }
  )
}
