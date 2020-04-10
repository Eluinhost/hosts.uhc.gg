package gg.uhc.hosts.reddit

import akka.actor.ActorSystem
import com.softwaremill.tagging.@@
import gg.uhc.hosts.{ConfigurationModule, RedditApiSystem}

trait RedditModule extends ConfigurationModule {
  def redditApiSystem: ActorSystem @@ RedditApiSystem

  private[this] lazy val queueSize = config.getInt("reddit.queueSize")

  lazy val authenticationApi: RedditAuthenticationApi = new RedditAuthenticationApi(
    redditApiSystem,
    config.getString("reddit.clientId"),
    config.getString("reddit.clientSecret"),
    config.getString("reddit.redirectUri"),
    queueSize
  )

  lazy val oauthApi: RedditSecuredApi = new RedditSecuredApi(redditApiSystem, queueSize)
}
