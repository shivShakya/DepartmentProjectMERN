using System;
using System.ComponentModel.DataAnnotations;

namespace MyWebApi.Model
{
    public class Alumni
    {
        [Key] 
        public long PRN { get; set; }

        [Required]
        [StringLength(45)]
        public string FirstName { get; set; }

        [StringLength(45)]
        public string MiddleName { get; set; }

        [Required]
        [StringLength(45)]
        public string LastName { get; set; }

        [Required]
        [StringLength(255)]
        [EmailAddress]
        public string Email { get; set; }

        [StringLength(20)]
        public string Phone { get; set; }

        [Required]
        [StringLength(4)]
        public string PassingYear { get; set; }

        [Required]
        [StringLength(60)]
        public string Course { get; set; }

        [Required]
        [StringLength(60)]
        public string Company { get; set; }

        [Required]
        [StringLength(60)]
        public string Position { get; set; }

        [Required]
        [StringLength(255)]
        public string linkdin { get; set; }

        [Required]
        [StringLength(50)]
        public string sector { get; set; }

        [Required]
        [StringLength(20)]
        public string password { get; set; }

        [Required]
        [StringLength(255)]
        public string image { get; set; }
    }
}
