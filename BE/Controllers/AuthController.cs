using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepo;
    private readonly IJockeyRepository _jockeyRepo;
    private readonly IRefereeRepository _refereeRepo;

    public AuthController(IAuthService authService, IUserRepository userRepo, IJockeyRepository jockeyRepo, IRefereeRepository refereeRepo)
    {
        _authService = authService;
        _userRepo = userRepo;
        _jockeyRepo = jockeyRepo;
        _refereeRepo = refereeRepo;
    }

    // Authentication
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [Authorize(Roles = "HorseOwner")]
    [HttpGet("me")]
    public async Task<ActionResult<OwnerProfileResponse>> GetCurrentOwner()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var result = await _authService.GetOwnerProfileAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult> GetProfile()
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(uid, out var userId)) return Unauthorized();

        var user = await _userRepo.GetByIdAsync(userId);
        if (user is null) return NotFound();

        return Ok(user.Role switch
        {
            UserRole.HorseOwner => user.OwnerProfile is not null
                ? new { user.Id, user.Email, user.FullName, Role = "HorseOwner", Type = "HorseOwner", Code = user.OwnerProfile.OwnerCode, Horses = user.OwnerProfile.Horses.Count, user.CreatedAt }
                : new { user.Id, user.Email, user.FullName, Role = "HorseOwner", Type = "HorseOwner", user.CreatedAt },
            UserRole.Jockey => await BuildJockeyProfileAsync(user),
            UserRole.Referee => await BuildRefereeProfileAsync(user),
            UserRole.Admin => new { user.Id, user.Email, user.FullName, Role = "Admin", Type = "Admin", user.CreatedAt },
            _ => new { user.Id, user.Email, user.FullName, Role = "Spectator", Type = "Spectator", user.CreatedAt }
        });
    }

    private async Task<object> BuildJockeyProfileAsync(User user)
    {
        var jockey = await _jockeyRepo.GetByUserIdAsync(user.Id);
        return jockey is null
            ? new { user.Id, user.Email, user.FullName, Role = "Jockey", Type = "Jockey", user.CreatedAt }
            : new { user.Id, user.Email, user.FullName, Role = "Jockey", Type = "Jockey", jockey.LicenseNumber, jockey.ExperienceYears, jockey.TotalRaces, jockey.TotalWins, WinRate = jockey.WinRate, jockey.Rank, jockey.Nationality, jockey.Status, user.CreatedAt };
    }

    private async Task<object> BuildRefereeProfileAsync(User user)
    {
        var referee = await _refereeRepo.GetByUserIdAsync(user.Id);
        return referee is null
            ? new { user.Id, user.Email, user.FullName, Role = "Referee", Type = "Referee", user.CreatedAt }
            : new { user.Id, user.Email, user.FullName, Role = "Referee", Type = "Referee", referee.LicenseNumber, referee.Specialization, referee.Rating, referee.TotalOfficiated, referee.Nationality, IsActive = referee.IsActive, user.CreatedAt };
    }

    // Roles
    [HttpGet("roles")]
    public ActionResult<string[]> GetRoles()
    {
        var roles = Enum.GetNames(typeof(UserRole));

        return Ok(roles);
    }

    // Chỉ trả về các role được phép đăng ký công khai (HorseOwner, Jockey, Spectator)
    [HttpGet("roles/register")]
    public ActionResult<string[]> GetRegisterRoles()
    {
        var roles = Enum.GetNames(typeof(UserRole))
            .Where(role =>
                string.Equals(role, nameof(UserRole.HorseOwner), StringComparison.Ordinal) ||
                string.Equals(role, nameof(UserRole.Jockey), StringComparison.Ordinal) ||
                string.Equals(role, nameof(UserRole.Spectator), StringComparison.Ordinal))
            .ToArray();

        return Ok(roles);
    }
}
