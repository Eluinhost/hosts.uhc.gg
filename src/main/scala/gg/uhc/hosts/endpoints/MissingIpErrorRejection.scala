package gg.uhc.hosts.endpoints

import akka.http.scaladsl.server.Rejection

case class MissingIpErrorRejection() extends Rejection

