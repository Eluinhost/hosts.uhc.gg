import sbt._

object Settings {
  val organisation = "gg.uhc"
  val name         = "hosts"
  val version      = "1.4.1"

  val scalacOptions = Seq(
    "-Xlint",
    "-unchecked",
    "-deprecation",
    "-feature"
  )

  object versions {
    val scala           = "2.13.1"
    val doobie          = "0.9.0"
    val circe           = "0.13.0"
    val akkaHttp        = "10.1.11"
    val akkaSlf4j       = "2.6.3"
    val akkaHttpCirce   = "1.31.0"
    val postgresql      = "42.2.12"
    val flyway          = "4.2.0"
    val hikaricp        = "3.4.2"
    val logback         = "1.2.3"
    val jwtCirce        = "4.3.0"
    val macwire         = "2.3.3"
    val caffeine        = "4.0.0"
    val metricsScala    = "4.1.5"
    val metricsInfluxDb = "1.1.0"
  }

  val dependencies = Def.setting(
    Seq(
      "com.typesafe.akka"        %% "akka-http"       % versions.akkaHttp,
      "com.typesafe.akka"        %% "akka-slf4j"      % versions.akkaSlf4j,
      "de.heikoseeberger"        %% "akka-http-circe" % versions.akkaHttpCirce,
      "org.tpolecat"             %% "doobie-core"     % versions.doobie,
      "org.tpolecat"             %% "doobie-hikari"   % versions.doobie,
      "org.tpolecat"             %% "doobie-postgres" % versions.doobie,
      "org.postgresql"           % "postgresql"       % versions.postgresql,
      "com.zaxxer"               % "HikariCP"         % versions.hikaricp,
      "ch.qos.logback"           % "logback-classic"  % versions.logback,
      "io.circe"                 %% "circe-generic"   % versions.circe,
      "org.flywaydb"             % "flyway-core"      % versions.flyway,
      "com.pauldijou"            %% "jwt-circe"       % versions.jwtCirce,
      "com.softwaremill.macwire" %% "macros"          % versions.macwire % Provided,
      "com.softwaremill.macwire" %% "util"            % versions.macwire,
      "com.github.blemale"       %% "scaffeine"       % versions.caffeine,
      "nl.grons"                 %% "metrics4-scala"  % versions.metricsScala,
      "com.github.davidb"        % "metrics-influxdb" % versions.metricsInfluxDb
    )
  )
}
