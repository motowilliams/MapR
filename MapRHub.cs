using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using SignalR.Hubs;

namespace MapR
{
	public class Response
	{
		public string Foo { get; set; }
	}

	public class LatLng
	{
		public decimal Pa { get; set; }
		public decimal Qa { get; set; }

		public override string ToString()
		{
			return string.Format("Lat: {0}, Lng: {1}", Pa, Qa);
		}
	}

	public class MapRHub : Hub, IDisconnect
	{
		private static readonly Dictionary<string, MapRClient> _maprClients = new Dictionary<string, MapRClient>();

		public Response SimpleTest(LatLng northEast, LatLng southWest)
		{
			return new Response { Foo = string.Format("{0},{1}", northEast, southWest) };
		}

		public MapRClient[] Join(LatLng northEast, LatLng southWest)
		{
			var mapRClient = new MapRClient { ClientId = Context.ClientId, Color = RandomColor(), Name = "User", NorthEast = northEast, SouthWest = southWest };
			System.Diagnostics.Debug.WriteLine("Adding " + mapRClient);
			_maprClients.Add(mapRClient.ClientId, mapRClient);
			Clients.joinResult(_maprClients);
			return _maprClients.Select(x => x.Value).ToArray();
		}

		public void BoundsChanged(LatLng northEast, LatLng southWest)
		{
			string clientId = Context.ClientId;
			MapRClient mapRClient = _maprClients.Where(x => x.Key.Equals(clientId)).Select(x => x.Value).FirstOrDefault();
			if (mapRClient == null) return;

			mapRClient.NorthEast = northEast;
			mapRClient.SouthWest = southWest;

			_maprClients.Remove(clientId);
			_maprClients.Add(clientId, mapRClient);

			//Clients.debug(string.Format("northEast: {0}, southWest: {1}", northEast, southWest));
			Clients.updateMasterBounds(_maprClients.Select(x => x.Value).ToArray());
			//var northEast = new GeometryLatLong { Pa = "1", Lng = "2" };
			//var southWest = new GeometryLatLong { Pa = "1", Lng = "2" };
			//var testClass = new GeometryBounds { NorthEast = northEast, SouthWest = southWest };
			//string serialize = JSONHelper.Serialize(testClass);
			//var deserialize = JSONHelper.Deserialize<GeometryBounds>(serialize);
		}

		public void Disconnect()
		{
			string clientId = Context.ClientId;
			System.Diagnostics.Debug.WriteLine("Removing client id " + clientId);
			if (_maprClients.ContainsKey(clientId))
				_maprClients.Remove(clientId);

			Clients.updateMasterBounds(_maprClients.Select(x => x.Value).ToArray());
		}

		private string RandomColor()
		{
			var random = new Random();
			return String.Format("#{0:X6}", random.Next(0x1000000));
		}
	}

	public class JSONHelper
	{
		public static string Serialize<T>(T obj)
		{
			DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
			MemoryStream ms = new MemoryStream();
			serializer.WriteObject(ms, obj);
			string retVal = Encoding.Default.GetString(ms.ToArray());
			ms.Dispose();
			return retVal;
		}

		public static T Deserialize<T>(string json)
		{
			T obj = Activator.CreateInstance<T>();
			MemoryStream ms = new MemoryStream(Encoding.Unicode.GetBytes(json));
			DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
			obj = (T)serializer.ReadObject(ms);
			ms.Close();
			ms.Dispose();
			return obj;
		}
	}

}