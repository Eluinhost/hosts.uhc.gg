resolvers += "Typesafe Releases" at "https://repo.typesafe.com/typesafe/releases/"

addSbtPlugin("io.spray"          % "sbt-revolver"         % "0.10.0")
addSbtPlugin("com.typesafe.sbt"  % "sbt-native-packager"  % "1.7.0")
addSbtPlugin("com.typesafe.sbt"  % "sbt-digest"           % "1.1.3")
addSbtPlugin("com.typesafe.sbt"  % "sbt-gzip"             % "1.0.2")
addSbtPlugin("net.virtual-void"  % "sbt-dependency-graph" % "0.9.2")
addSbtPlugin("com.typesafe.play" % "sbt-twirl"            % "1.6.10")
addSbtPlugin("com.timushev.sbt"  % "sbt-updates"          % "0.7.0")
