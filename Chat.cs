using System;
using SignalR.Hubs;

namespace MapR
{
	public class Chat : Hub
	{
		public void SendCenterMap(string lat, string lng, int zoomLevel)
		{
			Clients.centerMap(lat, lng, zoomLevel);
		}
	}
}