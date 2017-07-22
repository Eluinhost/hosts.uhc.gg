import sbt.Keys._
import NativePackagerHelper._

name := Settings.name
organization := Settings.organisation
version := Settings.version
scalaVersion := Settings.versions.scala
scalacOptions ++= Settings.scalacOptions
resolvers += "Bartek's repo at Bintray" at "https://dl.bintray.com/btomala/maven"
libraryDependencies ++= Settings.dependencies.value
mappings in Universal ++= directory(baseDirectory.value / "assets")
enablePlugins(JavaAppPackaging, SbtTwirl)
