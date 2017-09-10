package gg.uhc.hosts.reddit

import gg.uhc.hosts.ConfigurationModule

trait RedditModule extends ConfigurationModule {
  private[this] val queueSize = 10

  lazy val wwwRedditApi: WwwRedditApi = new WwwRedditApi(
    oauthClientId = config.getString("reddit.authentication.client.id"),
    oauthClientSecret = config.getString("reddit.authentication.client.secret"),
    redirectUri = config.getString("reddit.authentication.client.redirectUri"),
    queueSize = queueSize,
    botClientId = config.getString("reddit.bot.client.id"),
    botClientSecret = config.getString("reddit.bot.client.secret"),
    botUsername = config.getString("reddit.bot.login.username"),
    botPassword = config.getString("reddit.bot.login.password")
  )

  lazy val oauthApi: OauthRedditApi = new OauthRedditApi(
    discussionSubreddit = config.getString("reddit.bot.discussion subreddit"),
    queueSize = queueSize
  )
}
