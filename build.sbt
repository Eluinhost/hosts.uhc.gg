import sbt.Keys._
import NativePackagerHelper._

name := Settings.name
organization := Settings.organisation
version := Settings.version
scalaVersion := Settings.versions.scala
scalacOptions ++= Settings.scalacOptions
licenses := Seq("MIT" → url("https://tldrlegal.com/license/mit-license"))
resolvers ++= Seq(
  "Bartek's repo at Bintray" at "https://dl.bintray.com/btomala/maven",
  "jcenter" at "https://jcenter.bintray.com",
  "jitpack.io" at "https://jitpack.io"
)
libraryDependencies ++= Settings.dependencies.value

reForkOptions / run / connectInput := true

// include frontend assets in build
Universal / mappings ++= contentOf(baseDirectory.value / "frontend" / "build").flatMap {
  case (file, _) => file pair relativeTo(baseDirectory.value)
}

// copy reference config to conf folder for viewing when making an application.conf
Universal / mappings += {
  ((Compile / resourceDirectory).value / "reference.conf") → "conf/reference.conf"
}

// For api docs
Universal / mappings ++= directory(baseDirectory.value / "apidocs")

// Dont' package in zip in subdir
topLevelDirectory := None

// Don't generate javadocs
Compile / packageDoc / mappings := Seq()

// Look in conf folder for custom app configuration
bashScriptExtraDefines ++= Seq(
  "addJava \"-Dconfig.file=${app_home}/../conf/application.conf\"",
  "addJava \"-Duser.timezone=UTC\""
)
batScriptExtraDefines += """set _JAVA_OPTS=%_JAVA_OPTS% -Dconfig.file=%HOSTS_HOME%\\conf\\application.conf -Duser.timezone=UTC"""
reStart / javaOptions ++= Seq(s"-Dconfig.file=${baseDirectory.value.getAbsolutePath}/conf/application.conf", "-Duser.timezone=UTC")

enablePlugins(SbtTwirl, JavaAppPackaging)
