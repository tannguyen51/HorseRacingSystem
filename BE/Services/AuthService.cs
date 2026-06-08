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
        request.Email = request.Email.Trim();

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
        var email = request.Email.Trim();
        if (string.IsNullOrWhiteSpace(email))
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials.");
        }

        var user = await _users.GetByEmailAsync(email);
        if (user == null)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status401Unauthorized, "Invalid credentials.");
        }
        if (!user.IsActive)
        {
            return ServiceResult<AuthResponse>.Fail(StatusCodes.Status403Forbidden, "User is deactivated.");
        }

        var password = request.Password.Trim();
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);
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

    public async Task<ServiceResult<OwnerProfileResponse>> GetOwnerProfileAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user == null)
        {
            return ServiceResult<OwnerProfileResponse>.Fail(
                StatusCodes.Status404NotFound,
                "User not found.");
        }

        if (user.Role != UserRole.HorseOwner || user.OwnerProfile == null)
        {
            return ServiceResult<OwnerProfileResponse>.Fail(
                StatusCodes.Status404NotFound,
                "Owner profile not found.");
        }

        var owner = user.OwnerProfile;
        return ServiceResult<OwnerProfileResponse>.Ok(new OwnerProfileResponse
        {
            UserId = user.Id,
            OwnerId = owner.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role.ToString(),
            OwnerCode = owner.OwnerCode,
            OwnerType = owner.OwnerType,
            Status = owner.Status,
            JoinDate = owner.JoinDate,
            HorseCount = owner.Horses.Count
        });
    }

    private static string GenerateOwnerCode() =>
        $"OWN-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
}
