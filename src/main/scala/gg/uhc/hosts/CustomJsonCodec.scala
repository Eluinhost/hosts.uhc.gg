package gg.uhc.hosts

import de.heikoseeberger.akkahttpcirce.FailFastCirceSupport
import io.circe.generic.AutoDerivation
import io.circe.java8.time.TimeInstances

trait CustomJsonCodec extends FailFastCirceSupport with AutoDerivation with TimeInstances

object CustomJsonCodec extends CustomJsonCodec
