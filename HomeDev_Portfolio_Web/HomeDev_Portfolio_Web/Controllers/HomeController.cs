using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using HomeDev_Portfolio_Web.Models;

namespace HomeDev_Portfolio_Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Maps()
        {
            return View();
        }

        public IActionResult Animations()
        {
            return View();
        }

        public IActionResult SwitchController()
        {
            return View();
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
