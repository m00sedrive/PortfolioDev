using Microsoft.AspNetCore.Mvc;
using UserAccount.Models;

namespace UserAccount.Controllers
{
    public class UserProfilesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public UserProfilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Create/Edit Profile
        public IActionResult Edit(int? id)
        {
            if (id == null)
            {
                return View(new UserProfile());
            }

            var profile = _context.UserProfiles.Find(id);
            if (profile == null)
            {
                return NotFound();
            }

            return View(profile);
        }

        // POST: Save Profile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Edit(UserProfile profile)
        {
            if (ModelState.IsValid)
            {
                if (profile.Id == 0)
                {
                    _context.UserProfiles.Add(profile);
                }
                else
                {
                    _context.UserProfiles.Update(profile);
                }

                _context.SaveChanges();
                TempData["SuccessMessage"] = "Profile saved successfully!";
                return RedirectToAction(nameof(Edit), new { id = profile.Id });
            }

            return View(profile);
        }
    }
}
