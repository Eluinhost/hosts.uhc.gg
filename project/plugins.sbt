resolvers += "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"

addSbtPlugin("io.spray"         % "sbt-revolver"         % "0.8.0")
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager"  % "1.2.0-M9")
addSbtPlugin("com.typesafe.sbt" % "sbt-digest"           % "1.1.0")
addSbtPlugin("com.typesafe.sbt" % "sbt-gzip"             % "1.0.0")
addSbtPlugin("com.typesafe.sbt" % "sbt-twirl"            % "1.3.3")
addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.8.2")
