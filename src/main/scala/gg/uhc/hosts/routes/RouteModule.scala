package gg.uhc.hosts.routes

import com.softwaremill.macwire.wire
import gg.uhc.hosts.database.DatabaseModule
import gg.uhc.hosts.reddit.RedditModule
import gg.uhc.hosts.routes.endpoints._

trait RouteModule extends DatabaseModule with RedditModule {
  lazy val customDirectives: CustomDirectives = wire[CustomDirectives]

  lazy val listMatchesEndpoint: ListMatches = wire[ListMatches]
  lazy val createMatchesEndpoint: CreateMatch = wire[CreateMatch]
  lazy val removeMatchesEndpoint: RemoveMatch = wire[RemoveMatch]
  lazy val authEndpoint: Authenticate = wire[Authenticate]
  lazy val authCallbackEndpoint: AuthenticateCallback = wire[AuthenticateCallback]
  lazy val authRefreshEndpoint: AuthenticateRefresh = wire[AuthenticateRefresh]

  lazy val routes: Routes = wire[Routes]
}