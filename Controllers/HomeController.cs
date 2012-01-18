using System;
using System.Web.Mvc;

namespace MapR.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult Chat()
		{
			return View();
		}
	}
}
