using System;
using System.Collections.Generic;
using SignalR.Hubs;

namespace MapR
{
	public class MapRHub : Hub, IDisconnect
	{
		private static readonly Dictionary<string, MapRClient> _maprClients = new Dictionary<string, MapRClient>();
		public void Join()
		{
			var mapRClient = new MapRClient { ClientId = Context.ClientId, Color = RandomColor(), Name = "User" };
			System.Diagnostics.Debug.WriteLine("Adding " + mapRClient);
			_maprClients.Add(mapRClient.ClientId, mapRClient);
			Clients.joinResult(_maprClients);
			Clients.userCount(_maprClients.Count);
		}

		public void Disconnect()
		{
			string clientId = Context.ClientId;
			System.Diagnostics.Debug.WriteLine("Removing client id " + clientId);
			if (_maprClients.ContainsKey(clientId))
				_maprClients.Remove(clientId);

			Clients.joinResult(_maprClients);
			Clients.userCount(_maprClients.Count);
		}

		private string RandomColor()
		{
			var random = new Random();
			return String.Format("#{0:X6}", random.Next(0x1000000));
		}
	}
}