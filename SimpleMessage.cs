using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Web.Script.Serialization;
using SignalR;

namespace MapR
{
	public class SimpleMessage
	{
		public string Body { get; set; }
	}
}