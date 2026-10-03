package gg.uhc.hosts.endpoints

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.*
import scala.language.postfixOps

import com.github.blemale.scaffeine.{AsyncLoadingCache, Scaffeine}
import doobie.*
import gg.uhc.hosts.CustomJsonCodec
import gg.uhc.hosts.database.Database
import io.circe.{Json, JsonObject}
import io.circe.syntax.*

class BasicCache(database: Database) {

  import CustomJsonCodec.*

  private sealed trait ListingKey
  private object UpcomingMatches extends ListingKey

  implicit val ec: ExecutionContext = database.ec

  private val cache: AsyncLoadingCache[ListingKey, Json] = Scaffeine()
    .recordStats()
    .expireAfterWrite(5 minutes)
    .buildAsyncFuture[ListingKey, Json](loader = {
      case UpcomingMatches => database.run(listUpcomingMatchesQuery).map(_.asJson)
    })

  private def listUpcomingMatchesQuery: ConnectionIO[List[JsonObject]] =
    for {
      matches <- database.getUpcomingMatches
      perms   <- database.getPermissions(matches.map(_.author))
    } yield matches.map(row => row.toJsonWithRoles(perms.getOrElse(row.author, List.empty)))

  def getUpcomingMatches: Future[Json] = cache.get(UpcomingMatches)

  def invalidateUpcomingMatches(): Unit = cache.synchronous().invalidate(UpcomingMatches)
}
