package gg.uhc.hosts.authentication

import java.security.SecureRandom
import java.util.Base64

object SessionId {
  private val random = new SecureRandom()

  def generate(): String = {
    val bytes = new Array[Byte](32)
    random.nextBytes(bytes)
    Base64.getUrlEncoder.withoutPadding.encodeToString(bytes)
  }
}
