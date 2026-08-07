import sbt._

object Settings {
  val organisation = "gg.uhc"
  val name         = "hosts"
  val version      = "1.4.6"

  val scalacOptions = Seq(
    "-Xlint",
    "-unchecked",
    "-deprecation",
    "-feature"
  )

  object versions {
    val scala           = "3.8.4"
    val doobie          = "0.13.4"
    val circe           = "0.14.16"
    val pekko           = "1.6.0"
    val pekkoHttp       = "1.4.0"
    val pekkoHttpCirce  = "1.1.0"
    val postgresql      = "42.7.13"
    val flyway          = "13.0.0"
    val hikaricp        = "7.1.0"
    val logback         = "1.6.0"
    val jwtCirce        = "11.0.4"
    val macwire         = "2.6.7"
    val caffeine        = "5.3.0"
    val metricsScala    = "4.3.7"
    val metricsInfluxDb = "1.1.0"
  }

  val dependencies = Def.setting(
    Seq(
      "org.apache.pekko"         %% "pekko-http"                % versions.pekkoHttp,
      "org.apache.pekko"         %% "pekko-slf4j"               % versions.pekko,
      "org.apache.pekko"         %% "pekko-protobuf-v3"         % versions.pekko,
      "org.apache.pekko"         %% "pekko-stream"              % versions.pekko,
      "org.mdedetrich"           %% "pekko-stream-circe"        % versions.pekkoHttpCirce,
      "org.mdedetrich"           %% "pekko-http-circe"          % versions.pekkoHttpCirce,
      "org.tpolecat"             %% "doobie-core"               % versions.doobie,
      "org.tpolecat"             %% "doobie-hikari"             % versions.doobie,
      "org.tpolecat"             %% "doobie-postgres"           % versions.doobie,
      "org.postgresql"           % "postgresql"                 % versions.postgresql,
      "com.zaxxer"               % "HikariCP"                   % versions.hikaricp,
      "ch.qos.logback"           % "logback-classic"            % versions.logback,
      "io.circe"                 %% "circe-generic"             % versions.circe,
      "org.flywaydb"             % "flyway-core"                % versions.flyway,
      "org.flywaydb"             % "flyway-database-postgresql" % versions.flyway,
      "com.github.jwt-scala"     %% "jwt-circe"                 % versions.jwtCirce,
      "com.softwaremill.macwire" %% "macros"                    % versions.macwire % Provided,
      "com.softwaremill.macwire" %% "util"                      % versions.macwire,
      "com.github.blemale"       %% "scaffeine"                 % versions.caffeine,
      "nl.grons"                 %% "metrics4-scala"            % versions.metricsScala,
      "com.github.davidb"        % "metrics-influxdb"           % versions.metricsInfluxDb
    )
  )
}
