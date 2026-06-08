using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;

namespace HorseRacing.Services.Interfaces;

public interface IJockeyService
{
    Task<ServiceResult<object>> GetAvailableJockeysAsync();
    Task<ServiceResult<object>> GetInvitationsAsync(Guid userId);
    Task<ServiceResult<object>> RespondInvitationAsync(Guid userId, Guid invitationId, JockeyInvitationRespondRequest request);
    Task<ServiceResult<object>> GetAssignedRacesAsync(Guid userId);
}
