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
    private readonly INotificationService _notifications;

    public JockeyService(
        IUserRepository users,
        IJockeyRepository jockeys,
        IJockeyInvitationRepository invitations,
        IRaceEntryRepository raceEntries,
        IUnitOfWork unitOfWork,
        INotificationService notifications)
    {
        _users = users;
        _jockeys = jockeys;
        _invitations = invitations;
        _raceEntries = raceEntries;
        _unitOfWork = unitOfWork;
        _notifications = notifications;
    }

    public async Task<ServiceResult<object>> GetAvailableJockeysAsync(Guid currentUserId)
    {
        await EnsureJockeyProfilesAsync();
        var jockeys = await _jockeys.GetAvailableAsync();
        var response = jockeys
            .Where(jockey => jockey.UserId != currentUserId)
            .Select(jockey => new JockeyListResponse
        {
            Id = jockey.Id,
            UserId = jockey.UserId,
            FullName = jockey.User?.FullName ?? "Ky sĩ chưa đặt tên",
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
                Status = "Đang hoạt động",
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
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ kỵ sĩ");
        }

        var invitations = await _invitations.GetByJockeyAsync(jockey.Id);
        return ServiceResult<object>.Ok(invitations);
    }

    public async Task<ServiceResult<object>> RespondInvitationAsync(Guid userId, Guid invitationId, JockeyInvitationRespondRequest request)
    {
        var jockey = await _jockeys.GetByUserIdAsync(userId);
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ kỵ sĩ");
        }

        var invitation = await _invitations.GetByIdAsync(invitationId, jockey.Id);
        if (invitation == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy lời mời");
        }

        invitation.Status = request.Accept ? JockeyInvitationStatus.Accepted : JockeyInvitationStatus.Declined;

        if (request.Accept && invitation.RaceId.HasValue)
        {
            var entry = await _raceEntries.GetByRaceHorseAsync(invitation.RaceId.Value, invitation.HorseId);
            if (entry == null)
            {
                return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy đăng ký tham gia cho ngựa này");
            }

            if (entry.Race == null)
            {
                return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy cuộc đua");
            }

            var alreadyInTournament = await _raceEntries.IsJockeyInTournamentAsync(
                jockey.Id,
                entry.Race.TournamentId,
                entry.Id);
            if (alreadyInTournament)
            {
                return ServiceResult<object>.Fail(
                    StatusCodes.Status409Conflict,
                    "Kỵ sĩ này đã tham gia một cuộc đua trong cùng giải đấu");
            }

            entry.JockeyId = jockey.Id;
            entry.JockeyConfirmed = true;
        }

        await _unitOfWork.SaveChangesAsync();

        if (invitation.Horse?.Owner?.User != null)
        {
            var responseText = request.Accept ? "đã chấp nhận" : "đã từ chối";
            var nextStep = request.Accept
                ? "Kỵ sĩ đã được phân công cho ngựa."
                : "Bạn có thể chọn một kỵ sĩ khác cho ngựa.";

            await _notifications.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = invitation.Horse.Owner.UserId,
                Title = request.Accept ? "Kỵ sĩ đã chấp nhận lời mời" : "Kỵ sĩ đã từ chối lời mời",
                Message = $"{jockey.User?.FullName ?? "Kỵ sĩ"} {responseText} lời mời cho ngựa {invitation.Horse.Name}. {nextStep}",
                Type = NotificationType.InApp,
                Category = NotificationCategory.JockeyInvitation,
                ActionUrl = request.Accept
                    ? $"/owner/horses/{invitation.HorseId}"
                    : "/owner/horses",
                RelatedEntityId = invitation.Id,
                RelatedEntityType = nameof(JockeyInvitation)
            });
        }

        return ServiceResult<object>.Ok(invitation);
    }

    public async Task<ServiceResult<object>> GetAssignedRacesAsync(Guid userId)
    {
        var jockey = await _jockeys.GetByUserIdAsync(userId);
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ kỵ sĩ");
        }

        var races = await _raceEntries.GetByJockeyAsync(jockey.Id);
        return ServiceResult<object>.Ok(races);
    }
}
