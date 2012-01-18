using System;

namespace MapR
{
	public class MapRClient
	{
		public string ClientId { get; set; }
		public string Color { get; set; }
		public string Name { get; set; }

		public override string ToString()
		{
			return string.Format("ClientId: {0}, Color: {1}, Name: {2}", ClientId, Color, Name);
		}
	}
}