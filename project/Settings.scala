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
    val doobie          = "0.4.1"
    val circe           = "0.8.0"
    val akkaHttp        = "10.0.4"
    val akkaSlf4j       = "2.4.17"
    val akkaHttpCirce   = "1.15.0"
    val postgresql      = "42.1.0"
    val flyway          = "3.2.1"
    val hikaricp        = "2.4.5"
    val logback         = "1.1.3"
    val akkaHttpTwirl   = "1.2.0"
    val jwtCirce        = "0.12.1"
  }

  val dependencies = Def.setting(
    Seq(
      "com.typesafe.akka"                  %% "akka-http"       % versions.akkaHttp,
      "com.typesafe.akka"                  %% "akka-slf4j"      % versions.akkaSlf4j,
      "de.heikoseeberger"                  %% "akka-http-circe" % versions.akkaHttpCirce,
      "org.tpolecat"                       %% "doobie-core"     % versions.doobie,
      "org.tpolecat"                       %% "doobie-hikari"   % versions.doobie,
      "org.tpolecat"                       %% "doobie-postgres" % versions.doobie,
      "org.postgresql"                     % "postgresql"       % versions.postgresql,
      "com.zaxxer"                         % "HikariCP"         % versions.hikaricp,
      "ch.qos.logback"                     % "logback-classic"  % versions.logback,
      "io.circe"                           %% "circe-generic"   % versions.circe,
      "io.circe"                           %% "circe-java8"     % versions.circe,
      "btomala"                            %% "akka-http-twirl" % versions.akkaHttpTwirl,
      "org.flywaydb"                       % "flyway-core"      % versions.flyway,
      "com.pauldijou"                      %% "jwt-circe"       % versions.jwtCirce
    )
  )
}
