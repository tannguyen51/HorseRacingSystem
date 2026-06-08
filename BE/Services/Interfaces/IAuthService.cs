using System.Threading.Tasks;
using HorseRacing.Dtos;
using System;

namespace HorseRacing.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ServiceResult<OwnerProfileResponse>> GetOwnerProfileAsync(Guid userId);
}
