package gg.uhc.hosts.endpoints

import org.apache.pekko.http.scaladsl.model.{HttpRequest, HttpResponse}
import org.apache.pekko.http.scaladsl.server.Route
import org.apache.pekko.http.scaladsl.testkit.{RouteTest, TestFrameworkInterface}

trait EndpointRouteRunner extends RouteTest { this: TestFrameworkInterface =>
  def runRoute(route: Route, request: HttpRequest): HttpResponse =
    request ~> Route.seal(route) ~> check { response }
}
