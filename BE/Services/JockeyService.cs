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
    private readonly IUserRepository _users;
    private readonly IJockeyRepository _jockeys;
    private readonly IJockeyInvitationRepository _invitations;
    private readonly IRaceEntryRepository _raceEntries;
    private readonly IUnitOfWork _unitOfWork;

    public JockeyService(
        IUserRepository users,
        IJockeyRepository jockeys,
        IJockeyInvitationRepository invitations,
        IRaceEntryRepository raceEntries,
        IUnitOfWork unitOfWork)
    {
        _users = users;
        _jockeys = jockeys;
        _invitations = invitations;
        _raceEntries = raceEntries;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<object>> GetAvailableJockeysAsync()
    {
        await EnsureJockeyProfilesAsync();
        var jockeys = await _jockeys.GetAvailableAsync();
        var response = jockeys.Select(jockey => new JockeyListResponse
        {
            Id = jockey.Id,
            UserId = jockey.UserId,
            FullName = jockey.User?.FullName ?? "Unnamed jockey",
            Email = jockey.User?.Email ?? string.Empty,
            LicenseNumber = jockey.LicenseNumber,
            Nationality = jockey.Nationality,
            ExperienceYears = jockey.ExperienceYears,
            TotalRaces = jockey.TotalRaces,
            TotalWins = jockey.TotalWins,
            WinRate = jockey.WinRate,
            Rank = jockey.Rank,
            Status = jockey.Status,
            ApprovalStatus = (int)jockey.ApprovalStatus,
            ApprovalStatusName = jockey.ApprovalStatus.ToString()
        });

        return ServiceResult<object>.Ok(response);
    }

    private async Task EnsureJockeyProfilesAsync()
    {
        var users = await _users.GetAllAsync();
        var jockeyUsers = users.Where(user => user.IsActive && user.Role == UserRole.Jockey).ToList();
        if (jockeyUsers.Count == 0)
        {
            return;
        }

        var existingJockeys = await _jockeys.GetAllAsync();
        var existingUserIds = existingJockeys.Select(jockey => jockey.UserId).ToHashSet();
        var now = DateTime.UtcNow;

        foreach (var user in jockeyUsers.Where(user => !existingUserIds.Contains(user.Id)))
        {
            await _jockeys.AddAsync(new Jockey
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Status = "Active",
                ApprovalStatus = ApprovalStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        await _unitOfWork.SaveChangesAsync();
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
