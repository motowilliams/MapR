using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using SignalR.Hubs;

namespace MapR2
{
    public class MapRHub : Hub, IDisconnect, IConnected
    {
        private static readonly Dictionary<string, MapRClient> _maprClients = new Dictionary<string, MapRClient>();

        public void Join(decimal northEastLat, decimal northEastLon, decimal southWestLat, decimal southWestLon)
        {
            LatLng northEast = new LatLng { Pa = northEastLat, Qa = northEastLon };
            LatLng southWest = new LatLng { Pa = southWestLat, Qa = southWestLon };

            var mapRClient = new MapRClient { Id = Context.ConnectionId, Color = RandomColor(), Name = "User", NorthEast = northEast, SouthWest = southWest };
            //System.Diagnostics.Debug.WriteLine("Adding " + mapRClient);
            _maprClients[mapRClient.Id] = mapRClient;
            Clients.joinResult(_maprClients.Values.ToList());
            //return _maprClients.Values.ToList();
        }

        public void BoundsChanged(decimal northEastLat, decimal northEastLon, decimal southWestLat, decimal southWestLon)
        {
            LatLng northEast = new LatLng { Pa = northEastLat, Qa = northEastLon };
            LatLng southWest = new LatLng { Pa = southWestLat, Qa = southWestLon };

            string clientId = Context.ConnectionId;
            MapRClient mapRClient = _maprClients.Where(x => x.Key.Equals(clientId)).Select(x => x.Value).FirstOrDefault();
            if (mapRClient == null) return;

            mapRClient.NorthEast = northEast;
            mapRClient.SouthWest = southWest;

            _maprClients.Remove(clientId);
            _maprClients.Add(clientId, mapRClient);

            //Clients.debug(string.Format("northEast: {0}, southWest: {1}", northEast, southWest));
            MapRClient[] mapRClients = _maprClients.Select(x => x.Value).ToArray();

            MapRClient client = new MapRClient { Name = "myNameIs", Id = clientId, NorthEast = northEast, SouthWest = southWest, Color = RandomColor() };

            Clients.updateMasterBounds(_maprClients.Values);
            //var northEast = new GeometryLatLong { Pa = "1", Lng = "2" };
            //var southWest = new GeometryLatLong { Pa = "1", Lng = "2" };
            //var testClass = new GeometryBounds { NorthEast = northEast, SouthWest = southWest };
            //string serialize = JSONHelper.Serialize(testClass);
            //var deserialize = JSONHelper.Deserialize<GeometryBounds>(serialize);
        }

        public Task Disconnect()
        {
            if (_maprClients.ContainsKey(Context.ConnectionId))
                _maprClients.Remove(Context.ConnectionId);
            return Clients.leave(_maprClients.Values.ToList());
        }

        public Task Connect()
        {
            if (!_maprClients.ContainsKey(Context.ConnectionId))
                _maprClients.Add(Context.ConnectionId, new MapRClient { Id = Context.ConnectionId });
            return Clients.joined(_maprClients.Values.ToList());
        }

        public Task Reconnect(IEnumerable<string> groups)
        {
            if (!_maprClients.ContainsKey(Context.ConnectionId))
                _maprClients.Add(Context.ConnectionId, new MapRClient { Id = Context.ConnectionId });
            return Clients.rejoined(_maprClients.Values.ToList());
        }

        private string RandomColor()
        {
            var random = new Random();
            return String.Format("#{0:X6}", random.Next(0x1000000));
        }
    }

    public class MapRClient
    {
        public string Id { get; set; }
        public string Color { get; set; }
        public string Name { get; set; }
        public LatLng NorthEast { get; set; }
        public LatLng SouthWest { get; set; }
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
}