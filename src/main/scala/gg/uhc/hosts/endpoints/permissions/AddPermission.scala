package gg.uhc.hosts.endpoints.permissions

import org.apache.pekko.http.scaladsl.model.StatusCodes
import org.apache.pekko.http.scaladsl.server.*
import org.apache.pekko.http.scaladsl.server.Directives.*
import doobie.*
import doobie.free.connection.{raiseError, unit}
import doobie.implicits.*
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.{CustomDirectives, EndpointRejectionHandler}
import cats.implicits.*

class AddPermission(customDirectives: CustomDirectives, database: Database) {

  import customDirectives.*

  case class UserIsHostingBannedException()      extends Exception()
  case class UserAlreadyHasPermissionException() extends Exception()

  def apply(username: String, permission: String): Route =
    handleRejections(EndpointRejectionHandler()) {
      requireSessionAuthentication { session =>
        // get permissions for requester
        requireSucessfulQuery(database.getPermissions(session.username)) { userPermissions =>
          // check they can actual do this
          Permissions.requireCanModifyPermission(userPermissions, permission) {
            val withHandler = query(username = username, permission = permission, modifier = session.username).attempt

            requireSucessfulQuery(withHandler) {
              case Right(true)                                => complete(StatusCodes.Created)
              case Right(false)                               => complete(StatusCodes.BadRequest -> "Unknown error adding permission")
              case Left(_: UserIsHostingBannedException)      => complete(StatusCodes.BadRequest -> "User is hosting banned")
              case Left(_: UserAlreadyHasPermissionException) =>
                complete(StatusCodes.BadRequest -> "User already has this permission")
              case Left(x)                                    => failWith(x)
            }
          }
        }
      }
    }

  def stripPermissions(username: String, permissions: List[String], modifier: String): ConnectionIO[Unit] =
    permissions.foldRight(unit) { (permission, prev) =>
      prev.flatMap(_ => database.removePermission(username, permission, modifier)).map(_ => ())
    }

  def query(username: String, permission: String, modifier: String): ConnectionIO[Boolean] =
    database
      .getPermissions(username)
      .flatMap {
        case perms if perms.contains(permission)       =>
          raiseError[Unit](UserAlreadyHasPermissionException())
        // don't allow adding permissions if they're hosting banned
        case perms if perms.contains("hosting banned") =>
          raiseError[Unit](UserIsHostingBannedException())
        // if hosting banned is being added, first strip all existing perms from the user
        case perms if permission == "hosting banned"   =>
          stripPermissions(username, perms, modifier)
        // Don't do anything pre-add
        case _                                         =>
          unit
      }
      .flatMap { _ =>
        // now add the permission after the pre-checks have finished
        database.addPermission(username, permission, modifier)
      }
}
