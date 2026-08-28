package gg.uhc.hosts.endpoints.hostapplications

import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.PathMatchers.LongNumber
import org.apache.pekko.http.scaladsl.server.Route

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
