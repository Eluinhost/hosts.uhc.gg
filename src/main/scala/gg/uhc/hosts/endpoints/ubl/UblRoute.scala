package gg.uhc.hosts.endpoints.ubl

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class UblRoute(getCurrentUbl: GetCurrentUbl) {

  def apply(): Route =
    (get & path("current"))(getCurrentUbl())
}
