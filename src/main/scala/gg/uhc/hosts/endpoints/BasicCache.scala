package gg.uhc.hosts.endpoints

import com.github.blemale.scaffeine.{AsyncLoadingCache, Scaffeine}
import doobie._
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import io.circe.syntax._
import io.circe.{Json, JsonObject}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.language.postfixOps

class BasicCache(database: Database) {
  import CustomJsonCodec._

  private[this] sealed trait ListingKey
  private[this] object UpcomingMatches extends ListingKey
  private[this] object CurrentUbl      extends ListingKey

  implicit val ec: ExecutionContext = database.ec

  private[this] val cache: AsyncLoadingCache[ListingKey, Json] = Scaffeine()
    .recordStats()
    .expireAfterWrite(5 minutes)
    .buildAsyncFuture[ListingKey, Json](loader = {
      case UpcomingMatches => database.run(listUpcomingMatchesQuery).map(_.asJson)
      case CurrentUbl      => database.run(database.getCurrentUbl).map(_.asJson)
      case _               => Future.failed(new IllegalArgumentException("Unknown cache key"))
    })

  private[this] def listUpcomingMatchesQuery: ConnectionIO[List[JsonObject]] =
    for {
      matches <- database.getUpcomingMatches
      perms   <- database.getPermissions(matches.map(_.author))
    } yield matches.map(row => row.toJsonWithRoles(perms.getOrElse(row.author, List.empty)))

  def getUpcomingMatches: Future[Json] = cache.get(UpcomingMatches)
  def getCurrentUbl: Future[Json]      = cache.get(CurrentUbl)

  def invalidateUpcomingMatches(): Unit = cache.synchronous().invalidate(UpcomingMatches)
  def invalidateCurrentUbl(): Unit      = cache.synchronous().invalidate(CurrentUbl)
}
