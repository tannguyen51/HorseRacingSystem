using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace HorseRacing.Models;

[Table("Users")]
public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? FullName { get; set; }

    [Required]
    public UserRole Role { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Owner? OwnerProfile { get; set; }

    [JsonIgnore]
    public Jockey? JockeyProfile { get; set; }
}
