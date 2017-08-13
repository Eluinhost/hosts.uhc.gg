package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class PermissionsRoute(
    addPermission: AddPermission,
    listPermissions: ListPermissions,
    permissionModerationLog: PermissionModerationLog,
    removePermission: RemovePermission) {

  def apply(): Route =
    concat(
      get {
        concat(
          pathEndOrSingleSlash(listPermissions()),
          path("log")(permissionModerationLog())
        )
      },
      path(Segments(2)) { segments ⇒
        concat(
          post(addPermission(segments.head, segments.last)),
          delete(removePermission(segments.head, segments.last))
        )
      }
    )
}
