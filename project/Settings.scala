import sbt._

object Settings {
  val organisation = "gg.uhc"
  val name         = "hosts"
  val version      = "0.0.1"

  val scalacOptions = Seq(
    "-Xlint",
    "-unchecked",
    "-deprecation",
    "-feature"
  )

  object versions {
    val scala           = "2.12.2"
    val doobie          = "0.4.4"
    val circe           = "0.8.0"
    val akkaHttp        = "10.0.9"
    val akkaSlf4j       = "2.4.19"
    val akkaHttpCirce   = "1.17.0"
    val postgresql      = "42.1.3"
    val flyway          = "4.2.0"
    val hikaricp        = "2.6.3"
    val logback         = "1.2.3"
    val jwtCirce        = "0.14.0"
    val macwire         = "2.3.0"
    val caffeine        = "2.1.0"
    val akkaHttpTwirl   = "1.2.0"
    val metricsScala    = "3.5.9_a2.4"
    val metricsInfluxDb = "0.9.3"
    val discord4j       = "2.9"
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
      "io.circe"                 %% "circe-java8"     % versions.circe,
      "org.flywaydb"             % "flyway-core"      % versions.flyway,
      "com.pauldijou"            %% "jwt-circe"       % versions.jwtCirce,
      "com.softwaremill.macwire" %% "macros"          % versions.macwire % Provided,
      "com.softwaremill.macwire" %% "util"            % versions.macwire,
      "com.github.blemale"       %% "scaffeine"       % versions.caffeine,
      "btomala"                  %% "akka-http-twirl" % versions.akkaHttpTwirl,
      "nl.grons"                 %% "metrics-scala"   % versions.metricsScala,
      "com.github.davidb"        % "metrics-influxdb" % versions.metricsInfluxDb,
      "com.github.austinv11"     % "Discord4J"        % versions.discord4j
    )
  )
}
