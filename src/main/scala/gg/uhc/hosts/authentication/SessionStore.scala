package gg.uhc.hosts.authentication

import java.net.InetAddress

import scala.concurrent.Future

import gg.uhc.hosts.database.{CreatedSession, LiveSession}

trait SessionStore {
  def create(username: String, ip: Option[InetAddress], userAgent: Option[String]): Future[CreatedSession]
  def lookup(id: String): Future[Option[LiveSession]]
  def touch(id: String): Future[Unit]
  def rotate(id: String, newId: String): Future[Unit]
  def delete(id: String): Future[Unit]
  def logAccess(username: String, ip: Option[InetAddress]): Future[Unit]
  def purgeExpired: Future[Long]
}
