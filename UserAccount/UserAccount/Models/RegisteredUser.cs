using System.ComponentModel.DataAnnotations;

namespace UserAccount.Models
{
    public class RegisteredUser
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        public DateTime DateRegistered { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}
