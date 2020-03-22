package gg.uhc.hosts.endpoints.alerts

import java.time.Instant

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{as, complete, entity, handleRejections, provide, validate}
import akka.http.scaladsl.server.{Directive0, Directive1, Route}
import gg.uhc.hosts.{Alerts, CustomJsonCodec}
import gg.uhc.hosts.database.{AlertRuleRow, Database}
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}

class CreateAlertRule(customDirectives: CustomDirectives, database: Database) {
  import CustomJsonCodec._
  import customDirectives._

  case class CreateAlertRulePayload(field: String, alertOn: String, exact: Boolean)

  private[this] def convertPayload(payload: CreateAlertRulePayload, author: String): Directive1[AlertRuleRow] =
    provide(
      AlertRuleRow(
        field = payload.field.trim,
        alertOn = payload.alertOn.trim,
        exact = payload.exact,
        id = -1,
        createdBy = author,
        created = Instant.now()
      ))

  private[this] def validateRow(row: AlertRuleRow): Directive0 =
    validate(Alerts.allAlertFields.contains(row.field), "Invalid Field") &
      validate(row.alertOn.nonEmpty, "Value cannot be empty")

  def apply(): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireAuthentication { session =>
        requirePermission("hosting advisor", session.username) {
          entity(as[CreateAlertRulePayload]) { entity =>
            convertPayload(entity, session.username) { row =>
              (validateRow(row) & requireSucessfulQuery(database.createAlertRule(row))) { id =>
                complete(StatusCodes.Created -> row.copy(id = id))
              }
            }
          }
        }
      }
    }
}
