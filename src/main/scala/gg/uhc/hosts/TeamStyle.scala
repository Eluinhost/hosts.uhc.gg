package gg.uhc.hosts

sealed trait TeamStyle {
  val code: String
}

case class SizedTeamStyle(display: String, code: String) extends TeamStyle {
  def render(size: Int): String = s"$display To${if (size == 0) "X" else size}"
}

case object CustomTeamStyle extends TeamStyle {
  val code: String = "custom"

  def render(style: String): String = style
}

case class SimpleTeamStyle(display: String, code: String) extends TeamStyle {
  def render(): String = s"$display"
}

object TeamStyles {
  val ffa         = SimpleTeamStyle("FFA", "ffa")
  val chosen      = SizedTeamStyle("Chosen", "chosen")
  val random      = SizedTeamStyle("Random", "random")
  val captains    = SizedTeamStyle("Captains", "captains")
  val picked      = SizedTeamStyle("Picked", "picked")
  val slaveMarket = SimpleTeamStyle("Auction", "market")
  val mystery     = SizedTeamStyle("Mystery", "mystery")
  val rvb         = SimpleTeamStyle("Red Vs Blue", "rvb")
  val custom      = CustomTeamStyle

  val all: List[TeamStyle] =
    ffa :: chosen :: random :: captains :: picked :: slaveMarket :: mystery :: rvb :: custom :: Nil

  val byCode: Map[String, TeamStyle] = all.map(it ⇒ it.code → it).toMap
}
