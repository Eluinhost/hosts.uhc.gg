package gg.uhc.hosts.endpoints.users

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class UsersRoute(showPermissionsForUser: ShowPermissionsForUser) {

  // GET /{username}/permissions list -> lists all permissions for given username

  def apply(): Route =
    pathPrefix(Segment) { username =>
      (get & path("permissions"))(showPermissionsForUser(username))
    }
}
