using System.ComponentModel.DataAnnotations;
using UserAccount.Enums;

namespace UserAccount.Models
{
    public class UserProfile
    {
        public int Id { get; set; }

        [Required]
        [Display(Name = "First Name")]
        public string FirstName { get; set; }

        [Required]
        [Display(Name = "Last Name")]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Display(Name = "Business Phone")]
        [Phone]
        public string BusinessPhone { get; set; }

        [Required]
        [Display(Name = "Organisation Name")]
        public string OrganisationName { get; set; }

        [Required]
        [Display(Name = "VAT Number")]
        public string VatNumber { get; set; }

        [Required]
        [Display(Name = "Job Title")]
        public string JobTitle { get; set; }

        [Required]
        [Display(Name = "Membership Type")]
        public MembershipType MembershipType { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
