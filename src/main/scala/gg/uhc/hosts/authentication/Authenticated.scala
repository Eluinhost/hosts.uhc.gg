package gg.uhc.hosts.authentication

case class Authenticated(username: String, permissions: List[String])
