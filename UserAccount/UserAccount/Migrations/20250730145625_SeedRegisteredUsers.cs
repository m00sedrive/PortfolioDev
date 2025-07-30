using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserAccount.Migrations
{
    /// <inheritdoc />
    public partial class SeedRegisteredUsers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear test users (if any)
            migrationBuilder.Sql("DELETE FROM RegisteredUsers");

            for (int i = 1; i <= 20; i++)
            {
                var id = Guid.NewGuid();
                var email = $"testuser{i}@example.com";
                var dateRegistered = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff");

                migrationBuilder.Sql($@"
            INSERT INTO RegisteredUsers (Id, Email, DateRegistered, IsActive)
            VALUES ('{id}', '{email}', '{dateRegistered}', 1)
        ");
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM RegisteredUsers WHERE Email LIKE 'testuser%@example.com'");
        }

    }
}
