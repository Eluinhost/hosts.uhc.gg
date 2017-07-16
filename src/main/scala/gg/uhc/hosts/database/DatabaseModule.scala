package gg.uhc.hosts.database

import javax.sql.DataSource

import com.softwaremill.macwire.{wire, wireWith}
import com.typesafe.config.Config
import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import doobie.hikari.hikaritransactor.HikariTransactor
import doobie.util.iolite.IOLite
import gg.uhc.hosts.ConfigurationModule
import org.flywaydb.core.Flyway


trait DatabaseModule extends ConfigurationModule {
  private[this] def createHikariConfig(config: Config): HikariConfig = {
    val hkConfig = new HikariConfig()

    hkConfig.setJdbcUrl(config.getString("database.url"))
    hkConfig.setUsername(config.getString("database.user"))
    hkConfig.setPassword(config.getString("database.password"))

    hkConfig
  }

  private[this] def createHikariDataSource(config: HikariConfig) = new HikariDataSource(config)
  private[this] def createTransactor(dataSource: HikariDataSource): HikariTransactor[IOLite] =
    HikariTransactor[IOLite](dataSource)

  private[this] def createFlyway(source: DataSource): Flyway = {
    val flyway = new Flyway()
    flyway.setDataSource(source)
    flyway
  }

  lazy val hikariConfig: HikariConfig           = wireWith(createHikariConfig _)
  lazy val dataSource: HikariDataSource         = wireWith(createHikariDataSource _)
  lazy val transactor: HikariTransactor[IOLite] = wireWith(createTransactor _)
  lazy val migrations: Flyway                   = wireWith(createFlyway _)
  lazy val database: Database                   = wire[Database]
}
