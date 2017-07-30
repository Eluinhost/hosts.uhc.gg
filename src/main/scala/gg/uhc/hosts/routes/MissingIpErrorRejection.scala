package gg.uhc.hosts.routes

import akka.http.scaladsl.server.Rejection

case class MissingIpErrorRejection() extends Rejection

