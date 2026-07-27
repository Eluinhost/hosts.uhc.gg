package gg.uhc.hosts.endpoints.alerts

import org.apache.pekko.http.scaladsl.server.Directives.{concat, delete, path, get, pathEndOrSingleSlash, post}
import org.apache.pekko.http.scaladsl.server.PathMatchers.LongNumber
import org.apache.pekko.http.scaladsl.server.Route

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
