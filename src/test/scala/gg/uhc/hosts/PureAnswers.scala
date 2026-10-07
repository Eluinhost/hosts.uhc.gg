package gg.uhc.hosts

import cats.{Id, ~>}
import doobie.*
import doobie.free.connection.ConnectionOp
import doobie.free.connection.ConnectionOp.HandleErrorWith
import org.scalamock.stubs.StubbedMethod

import scala.concurrent.Future
import scala.util.control.NonFatal

class PureAnswers(run: StubbedMethod[ConnectionIO[Any], Future[Any]]) {
  def install(): Unit =
    run.returns { (program: ConnectionIO[Any]) =>
      Future.successful(program.foldMap(interpretPureStructure))
    }

  private val interpretPureStructure: ConnectionOp ~> Id = new (ConnectionOp ~> Id) {
    def apply[A](operation: ConnectionOp[A]): Id[A] = operation match {
      case HandleErrorWith(fa, f) =>
        try fa.foldMap(this)
        catch {
          case e: AssertionError => throw e
          case NonFatal(e)       => f(e).foldMap(this)
        }
      case _                      =>
        throw new AssertionError(s"No spec stubbed a query builder for this operation: $operation")
    }
  }
}
