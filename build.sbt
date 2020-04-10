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
  "jcenter" at "http://jcenter.bintray.com",
  "jitpack.io" at "https://jitpack.io"
)
libraryDependencies ++= Settings.dependencies.value

reForkOptions ~= (_.copy(connectInput = true))

// include frontend assets in build
mappings in Universal ++= contentOf(baseDirectory.value / "frontend" / "build").flatMap {
  case (file, _) => file pair relativeTo(baseDirectory.value)
}

// copy reference config to conf folder for viewing when making an application.conf
mappings in Universal += {
  ((resourceDirectory in Compile).value / "reference.conf") → "conf/reference.conf"
}

// For api docs
mappings in Universal ++= directory(baseDirectory.value / "apidocs")

// Dont' package in zip in subdir
topLevelDirectory := None

// Don't generate javadocs
mappings in (Compile, packageDoc) := Seq()

// Look in conf folder for custom app configuration
bashScriptExtraDefines ++= Seq(
  "addJava \"-Dconfig.file=${app_home}/../conf/application.conf\"",
  "addJava \"-Duser.timezone=UTC\""
)
batScriptExtraDefines += """set _JAVA_OPTS=%_JAVA_OPTS% -Dconfig.file=%HOSTS_HOME%\\conf\\application.conf -Duser.timezone=UTC"""
javaOptions in reStart ++= Seq(s"-Dconfig.file=${baseDirectory.value.getAbsolutePath}/conf/application.conf", "-Duser.timezone=UTC")

enablePlugins(SbtTwirl, JavaAppPackaging)
