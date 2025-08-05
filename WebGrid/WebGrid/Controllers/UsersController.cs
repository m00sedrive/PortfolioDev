using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Web.Helpers;
using WebGrid.Models;


namespace WebGrid.Controllers
{
    public class UsersController : Controller
    {
        // Simulated data source (replace with database)
        private static List<User> _users = new List<User>
        {
            new User { FirstName = "John", LastName = "Doe", Email = "john@example.com", Contact="123456789", VatNumber="VAT123", JobTitle="Manager", OrganizationName="ABC Ltd", Website="http://abc.com" },
            new User { FirstName = "Jane", LastName = "Smith", Email = "jane@example.com", Contact="987654321", VatNumber="VAT456", JobTitle="Developer", OrganizationName="XYZ Inc", Website="http://xyz.com" }
            // Add more sample users
        };

        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = Enumerable.Range(1, 100).Select(i => new
            {
                FirstName = $"First{i}",
                LastName = $"Last{i}",
                Email = $"user{i}@example.com",
                Contact = $"123-456-78{i:D2}",
                VatNumber = $"VAT{i:D5}",
                JobTitle = $"Job Title {i}",
                OrganizationName = $"Organization {i}",
                Website = $"https://website{i}.com"
            }).ToList();

            // Force proper JSON serialization
            var json = JsonSerializer.Serialize(new { data = users });

            return Content(json, "application/json");
        }
    }
}
