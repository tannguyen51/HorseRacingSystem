using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HorseRacing.Controllers;

/// <summary>
/// Xử lý đăng ký, đăng nhập và tra cứu vai trò người dùng.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
