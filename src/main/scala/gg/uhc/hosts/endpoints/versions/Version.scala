package gg.uhc.hosts.endpoints.versions

case class Version(id: Int, displayName: String, weight: Int)

object Version {
  val options: List[Version] = List(
    Version(1, "1.15", 1),
    Version(2, "1.14", 1),
    Version(3, "1.13", 1),
    Version(4, "1.12", 1),
    Version(5, "1.11", 1),
    Version(6, "1.10", 1),
    Version(7, "1.9", 1),
    Version(8, "1.8", 2),
    Version(9, "1.7", 2),
    Version(10, "1.6", 1),
    Version(11, "1.5", 1),
    Version(12, "1.4", 1),
    Version(13, "1.3", 1),
    Version(14, "1.2", 1),
    Version(14, "Other (specify in range field)", 0),
  )
}
