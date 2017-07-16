package gg.uhc.hosts.routes

import akka.http.scaladsl.server.Rejection

case class DatabaseErrorRejection(cause: Throwable) extends Rejection

