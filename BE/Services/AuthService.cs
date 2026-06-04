using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace HorseRacing.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IOwnerRepository _owners;
    private readonly IJockeyRepository _jockeys;
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtTokenService _jwtTokenService;
    private readonly PasswordHasher<User> _passwordHasher = new();

    public AuthService(
        IUserRepository users,
        IOwnerRepository owners,
        IJockeyRepository jockeys,
        IUnitOfWork unitOfWork,
        JwtTokenService jwtTokenService)
    {
        _users = users;
        _owners = owners;
        _jockeys = jockeys;
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (request.Role is not (UserRole.HorseOwner or UserRole.Jockey or UserRole.Spectator))
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status400BadRequest, "Unsupported role.");
        }

        var exists = await _users.EmailExistsAsync(request.Email);
        if (exists)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status409Conflict, "Email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Role = request.Role,
            FullName = request.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);

        var now = DateTime.UtcNow;

        if (request.Role == UserRole.HorseOwner)
        {
            var owner = new Owner
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                OwnerCode = GenerateOwnerCode(),
                OwnerType = "Individual",
                JoinDate = now,
                Status = "Active",
                CreatedAt = now,
                UpdatedAt = now
            };
            await _owners.AddAsync(owner);
        }

        if (request.Role == UserRole.Jockey)
        {
            var jockey = new Jockey
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                LicenseNumber = request.LicenseNumber,
                ApprovalStatus = ApprovalStatus.Pending,
                Status = "Active",
                CreatedAt = now,
                UpdatedAt = now
            };
            await _jockeys.AddAsync(jockey);
        }

        await _unitOfWork.SaveChangesAsync();

        var token = _jwtTokenService.CreateToken(user);
        var response = new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        return ServiceResult<AuthResponse>.Ok(response);
    }

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _users.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials.");
        }
        if (!user.IsActive)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status403Forbidden, "User is deactivated.");
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials.");
        }

        var token = _jwtTokenService.CreateToken(user);
        var response = new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        return ServiceResult<AuthResponse>.Ok(response);
    }

    private static string GenerateOwnerCode() =>
        $"OWN-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
}
