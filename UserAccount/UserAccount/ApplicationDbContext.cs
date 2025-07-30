using Microsoft.EntityFrameworkCore;
using UserAccount.Models;

namespace UserAccount
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<UserProfile> UserProfiles { get; set; }

        public DbSet<RegisteredUser> RegisteredUsers { get; set; }
    }
}
