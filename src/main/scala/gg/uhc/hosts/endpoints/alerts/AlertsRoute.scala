package gg.uhc.hosts.endpoints.alerts

import akka.http.scaladsl.server.Directives.{concat, delete, path, get, pathEndOrSingleSlash, post}
import akka.http.scaladsl.server.PathMatchers.LongNumber
import akka.http.scaladsl.server.Route

class AlertsRoute(
    getAllAlertRules: GetAllAlertRules,
    createAlertRule: CreateAlertRule,
    deleteAlertRule: DeleteAlertRule) {
  def apply(): Route =
    concat(
      (get & pathEndOrSingleSlash)(getAllAlertRules()),
      (post & pathEndOrSingleSlash)(createAlertRule()),
      (delete & path(LongNumber))(deleteAlertRule(_))
    )
}
