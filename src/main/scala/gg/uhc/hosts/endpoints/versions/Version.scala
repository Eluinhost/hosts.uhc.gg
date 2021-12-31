package gg.uhc.hosts.endpoints.versions

case class Version(id: Int, displayName: String, weight: Int)

object Version {
  val options: List[Version] = List(
    Version(1, "1.15", 2),
    Version(2, "1.14", 2),
    Version(3, "1.13", 2),
    Version(4, "1.12", 2),
    Version(5, "1.11", 2),
    Version(6, "1.10", 2),
    Version(7, "1.9", 1),
    Version(8, "1.8", 3),
    Version(9, "1.7", 3),
    Version(10, "1.6", 1),
    Version(11, "1.5", 1),
    Version(12, "1.4", 1),
    Version(13, "1.3", 1),
    Version(14, "1.2", 1),
    Version(14, "Other (specify in range field)", 0),
    Version(15, "1.16", 2),
    Version(16, "1.17", 2),
    Version(17, "1.18", 2),
  )
}
