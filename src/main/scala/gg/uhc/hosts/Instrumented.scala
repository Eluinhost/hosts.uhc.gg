package gg.uhc.hosts

import java.util.concurrent.TimeUnit

import akka.http.scaladsl.server.directives.BasicDirectives.{extractRequestContext, mapRouteResult}
import akka.http.scaladsl.server.{Directive, Directive0, Directives}
import com.codahale.metrics.MetricRegistry
import metrics_influxdb.{HttpInfluxdbProtocol, InfluxdbReporter}
import nl.grons.metrics.scala.{Counter, InstrumentedBuilder, Timer}

object Instrumented {
  val metricRegistry = new MetricRegistry()

  InfluxdbReporter
    .forRegistry(metricRegistry)
    .convertDurationsTo(TimeUnit.MILLISECONDS)
    .convertRatesTo(TimeUnit.SECONDS)
    .skipIdleMetrics(true)
    .protocol(new HttpInfluxdbProtocol("localhost", 8086, "akka-metrics"))
    .build()
    .start(1, TimeUnit.SECONDS)
}

trait Instrumented extends InstrumentedBuilder {
  val metricRegistry: MetricRegistry = Instrumented.metricRegistry

  def timed(timer: Timer): Directive0 =
    extractRequestContext.flatMap { _ ⇒
      val tCtx = timer.timerContext()

      mapRouteResult { result ⇒
        tCtx.stop()
        result
      }
    }

  def counting(counter: Counter): Directive0 =
    extractRequestContext.flatMap { _ ⇒
      counter.inc()
      Directive.Empty
    }
}

