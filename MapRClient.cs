using System;

namespace MapR
{
	public class MapRClient
	{
		public string ClientId { get; set; }
		public string Color { get; set; }
		public string Name { get; set; }
		public LatLng NorthEast { get; set; }
		public LatLng SouthWest { get; set; }
	}
}