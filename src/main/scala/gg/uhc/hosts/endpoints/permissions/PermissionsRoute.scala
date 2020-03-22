package gg.uhc.hosts.endpoints.permissions

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route

class PermissionsRoute(
    listUserCountForEachPermission: ListUserCountForEachPermission,
    listUsersInPermission: ListUsersInPermission,
    listUsersInPermissionBeginningWith: ListUsersInPermissionBeginningWith,
    addPermission: AddPermission,
    permissionModerationLog: PermissionModerationLog,
    removePermission: RemovePermission) {


  // GET / -> show map of perm name to count
  // GET /log -> show log of permission changes
  // GET /{permission} -> show either a list of usernames or map of first letter to count
  // GET /{permission}/{letter} -> show a list of usernames with that letter in that permission
  // POST /{permission}/{username} -> adds permission to username
  // DELETE /{permission}/{username} -> removes permission from username

  def apply(): Route =
    concat(
      (get & pathEndOrSingleSlash)(listUserCountForEachPermission()),
      (get & path("log"))(permissionModerationLog()),
      pathPrefix(Segment) { permission =>
        concat(
          (get & pathEndOrSingleSlash)(listUsersInPermission(permission)),
          path(Segment) { segment =>
            concat(
              post(addPermission(username = segment, permission = permission)),
              delete(removePermission(username = segment, permission = permission)),
              get(listUsersInPermissionBeginningWith(permission = permission, startsWith = segment))
            )
          }
        )
      }
    )
}
