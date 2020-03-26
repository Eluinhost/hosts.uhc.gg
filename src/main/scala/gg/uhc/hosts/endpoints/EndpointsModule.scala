package gg.uhc.hosts.endpoints

import akka.stream.Materializer
import com.softwaremill.macwire.wire
import gg.uhc.hosts.database.Database
import gg.uhc.hosts.endpoints.alerts.{AlertsRoute, CreateAlertRule, DeleteAlertRule, GetAllAlertRules}
import gg.uhc.hosts.endpoints.assets.AssetsRoute
import gg.uhc.hosts.endpoints.authentication.{Authenticate, AuthenticateCallback, AuthenticateRefresh, AuthenticationRoute}
import gg.uhc.hosts.endpoints.docs.DocsRoute
import gg.uhc.hosts.endpoints.frontend.FrontendRoute
import gg.uhc.hosts.endpoints.hosts.{GetHostingHistory, HostsRoute}
import gg.uhc.hosts.endpoints.key.{GetApiKey, KeyRoute, RegenerateApiKey}
import gg.uhc.hosts.endpoints.matches._
import gg.uhc.hosts.endpoints.permissions._
import gg.uhc.hosts.endpoints.rules.{GetLatestRules, RulesRoute, SetRules}
import gg.uhc.hosts.endpoints.sync.{GetTime, SyncRoute}
import gg.uhc.hosts.endpoints.ubl._
import gg.uhc.hosts.reddit.RedditModule

trait EndpointsModule extends RedditModule {
  def database: Database
  def materializer: Materializer

  lazy val customDirectives: CustomDirectives = wire[CustomDirectives]

  lazy val listUpcomingEndpoint: ListUpcomingMatches                      = wire[ListUpcomingMatches]
  lazy val createMatchesEndpoint: CreateMatch                             = wire[CreateMatch]
  lazy val removeMatchesEndpoint: RemoveMatch                             = wire[RemoveMatch]
  lazy val showMatchEndpoint: ShowMatch                                   = wire[ShowMatch]
  lazy val authEndpoint: Authenticate                                     = wire[Authenticate]
  lazy val authCallbackEndpoint: AuthenticateCallback                     = wire[AuthenticateCallback]
  lazy val authRefreshEndpoint: AuthenticateRefresh                       = wire[AuthenticateRefresh]
  lazy val getTime: GetTime                                               = wire[GetTime]
  lazy val removePermission: RemovePermission                             = wire[RemovePermission]
  lazy val addPermission: AddPermission                                   = wire[AddPermission]
  lazy val permissionModerationLog: PermissionModerationLog               = wire[PermissionModerationLog]
  lazy val listUserCountForEachPermission: ListUserCountForEachPermission = wire[ListUserCountForEachPermission]
  lazy val listUsersInPermission: ListUsersInPermission                   = wire[ListUsersInPermission]
  lazy val listUsersInPermissionBeginningWith: ListUsersInPermissionBeginningWith =
    wire[ListUsersInPermissionBeginningWith]
  lazy val checkConflicts: CheckConflicts       = wire[CheckConflicts]
  lazy val getApiKey: GetApiKey                 = wire[GetApiKey]
  lazy val regenerateApiKey: RegenerateApiKey   = wire[RegenerateApiKey]
  lazy val getLatestRules: GetLatestRules       = wire[GetLatestRules]
  lazy val setRules: SetRules                   = wire[SetRules]
  lazy val approveMatch: ApproveMatch           = wire[ApproveMatch]
  lazy val getCurrentUbl: GetCurrentUbl         = wire[GetCurrentUbl]
  lazy val getHostingHistory: GetHostingHistory = wire[GetHostingHistory]
  lazy val createUblEntry: CreateUblEntry       = wire[CreateUblEntry]
  lazy val getUblForUuid: GetUblForUuid         = wire[GetUblForUuid]
  lazy val usernameSearch: UsernameSearch       = wire[UsernameSearch]
  lazy val extendUblEntry: EditUblEntry         = wire[EditUblEntry]
  lazy val deleteUblEntry: DeleteUblEntry       = wire[DeleteUblEntry]
  lazy val createAlertRule: CreateAlertRule     = wire[CreateAlertRule]
  lazy val deleteAlertRule: DeleteAlertRule     = wire[DeleteAlertRule]
  lazy val getAllAlertRules: GetAllAlertRules   = wire[GetAllAlertRules]

  lazy val basicCache: BasicCache                   = wire[BasicCache]
  lazy val assetsRoute: AssetsRoute                 = wire[AssetsRoute]
  lazy val authenticationRoute: AuthenticationRoute = wire[AuthenticationRoute]
  lazy val docsRoute: DocsRoute                     = wire[DocsRoute]
  lazy val frontendRoute: FrontendRoute             = wire[FrontendRoute]
  lazy val keyRoute: KeyRoute                       = wire[KeyRoute]
  lazy val matchesRoute: MatchesRoute               = wire[MatchesRoute]
  lazy val permissionsRoute: PermissionsRoute       = wire[PermissionsRoute]
  lazy val rulesRoute: RulesRoute                   = wire[RulesRoute]
  lazy val syncRoute: SyncRoute                     = wire[SyncRoute]
  lazy val apiRoute: ApiRoute                       = wire[ApiRoute]
  lazy val ublRoute: UblRoute                       = wire[UblRoute]
  lazy val hostsRoute: HostsRoute                   = wire[HostsRoute]
  lazy val alertsRoute: AlertsRoute                 = wire[AlertsRoute]
  lazy val baseRoute: BaseRoute                     = wire[BaseRoute]
}
