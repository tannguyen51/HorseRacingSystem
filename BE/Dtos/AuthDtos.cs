using System.ComponentModel.DataAnnotations;
using HorseRacing.Models;

namespace HorseRacing.Dtos;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }

    public string? FullName { get; set; }

    public string? LicenseNumber { get; set; }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponse
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string Token { get; set; } = string.Empty;
}

public class OwnerProfileResponse
{
    public Guid UserId { get; set; }
    public Guid OwnerId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Role { get; set; } = string.Empty;
    public string OwnerCode { get; set; } = string.Empty;
    public string OwnerType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime JoinDate { get; set; }
    public int HorseCount { get; set; }
}
