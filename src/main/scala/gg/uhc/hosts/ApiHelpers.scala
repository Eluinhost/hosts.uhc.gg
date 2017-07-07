package gg.uhc.hosts

import com.typesafe.config.ConfigFactory
import gg.uhc.hosts.reddit.{RedditAuthenticationApi, RedditSecuredApi}

object ApiHelpers {
  private[this] val config = ConfigFactory.load()
  private[this] val clientId = config.getString("reddit.clientId")
  private[this] val clientSecret = config.getString("reddit.clientSecret")
  private[this] val redirectUri = config.getString("reddit.redirectUri")
  private[this] val queueSize = config.getInt("reddit.queueSize")

  val authentication = new RedditAuthenticationApi(
    clientId,
    clientSecret,
    redirectUri,
    queueSize
  )

  val api = new RedditSecuredApi(queueSize)
}
