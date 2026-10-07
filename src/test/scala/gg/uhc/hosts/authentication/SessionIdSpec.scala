package gg.uhc.hosts.authentication

import munit.FunSuite

class SessionIdSpec extends FunSuite {
  test("an id is 256 bits of base64url without padding") {
    assertEquals(SessionId.generate().length, 43)
  }

  test("an id uses only cookie-value safe characters") {
    (1 to 100).map(_ => SessionId.generate()).foreach { id =>
      assert(id.matches("[A-Za-z0-9_-]+"))
    }
  }

  test("generates unique ids") {
    val ids = (1 to 1000).map(_ => SessionId.generate())

    assertEquals(ids.distinct.length, 1000)
  }
}
