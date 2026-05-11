using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

public class JockeyService : IJockeyService
{
    private readonly IJockeyRepository _jockeys;
    private readonly IJockeyInvitationRepository _invitations;
    private readonly IRaceEntryRepository _raceEntries;
    private readonly IUnitOfWork _unitOfWork;

    public JockeyService(
        IJockeyRepository jockeys,
        IJockeyInvitationRepository invitations,
        IRaceEntryRepository raceEntries,
        IUnitOfWork unitOfWork)
    {
        _jockeys = jockeys;
        _invitations = invitations;
        _raceEntries = raceEntries;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<object>> GetInvitationsAsync(Guid userId)
    {
        var jockey = await _jockeys.GetByUserIdAsync(userId);
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Jockey profile not found.");
        }

        var invitations = await _invitations.GetByJockeyAsync(jockey.Id);
        return ServiceResult<object>.Ok(invitations);
    }

    public async Task<ServiceResult<object>> RespondInvitationAsync(Guid userId, Guid invitationId, JockeyInvitationRespondRequest request)
    {
        var jockey = await _jockeys.GetByUserIdAsync(userId);
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Jockey profile not found.");
        }

        var invitation = await _invitations.GetByIdAsync(invitationId, jockey.Id);
        if (invitation == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Invitation not found.");
        }

        invitation.Status = request.Accept ? JockeyInvitationStatus.Accepted : JockeyInvitationStatus.Declined;

        if (request.Accept && invitation.RaceId.HasValue)
        {
            var entry = await _raceEntries.GetByRaceHorseAsync(invitation.RaceId.Value, invitation.HorseId);
            if (entry == null)
            {
                return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Race entry not found for this horse.");
            }

            entry.JockeyId = jockey.Id;
            entry.JockeyConfirmed = true;
        }

        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(invitation);
    }

    public async Task<ServiceResult<object>> GetAssignedRacesAsync(Guid userId)
    {
        var jockey = await _jockeys.GetByUserIdAsync(userId);
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Jockey profile not found.");
        }

        var races = await _raceEntries.GetByJockeyAsync(jockey.Id);
        return ServiceResult<object>.Ok(races);
    }
}
