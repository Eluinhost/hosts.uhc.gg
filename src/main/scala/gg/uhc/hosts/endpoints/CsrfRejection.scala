package gg.uhc.hosts.endpoints

import org.apache.pekko.http.scaladsl.server.Rejection

case class CsrfRejection(reason: String) extends Rejection
