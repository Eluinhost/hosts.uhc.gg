package gg.uhc.hosts

import com.typesafe.config.{Config, ConfigFactory}

trait ConfigurationModule {
  lazy val config: Config = ConfigFactory.load()
}
