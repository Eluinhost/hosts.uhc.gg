package gg.uhc.hosts.reddit

import gg.uhc.hosts.ConfigurationModule

trait RedditModule extends ConfigurationModule {
  private[this] lazy val queueSize = config.getInt("reddit.queueSize")

  lazy val authenticationApi: RedditAuthenticationApi = new RedditAuthenticationApi(
    config.getString("reddit.clientId"),
    config.getString("reddit.clientSecret"),
    config.getString("reddit.redirectUri"),
    queueSize
  )

  lazy val oauthApi: RedditSecuredApi = new RedditSecuredApi(queueSize)
}
