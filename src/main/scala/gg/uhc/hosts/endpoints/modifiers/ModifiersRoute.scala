package gg.uhc.hosts.endpoints.modifiers

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._

class ModifiersRoute(listModifiers: ListModifiers, createModifier: CreateModifier, deleteModifier: DeleteModifier) {
  def apply(): Route =
    concat(
      pathEndOrSingleSlash {
        concat(
          get(listModifiers()),
          post(createModifier())
        )
      },
      (delete & path(IntNumber)) { id =>
        pathEndOrSingleSlash(deleteModifier(id))
      }
    )
  }
