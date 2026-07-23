package gg.uhc.hosts.endpoints.hostapplications

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.PathMatchers.LongNumber
import akka.http.scaladsl.server.Route

class HostApplicationsRoute(
    getHostApplications: GetHostApplications,
    getHostApplicationDetails: GetHostApplicationDetails,
    createHostApplication: CreateHostApplication,
    reviewHostApplication: ReviewHostApplication) {
  def apply(): Route =
    concat(
      (get & pathEndOrSingleSlash)(getHostApplications()),
      (post & pathEndOrSingleSlash)(createHostApplication()),
      path(LongNumber / "approve")(id => post(reviewHostApplication(id, "approved"))),
      path(LongNumber / "decline")(id => post(reviewHostApplication(id, "declined"))),
      (get & path(LongNumber))(getHostApplicationDetails(_))
    )
}