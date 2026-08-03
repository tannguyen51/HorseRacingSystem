using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Services;

public class HorseService : IHorseService
{
    private readonly IHorseRepository _horses;
    private readonly IOwnerRepository _owners;
    private readonly IJockeyRepository _jockeys;
    private readonly IRaceRepository _races;
    private readonly IRaceEntryRepository _raceEntries;
    private readonly IJockeyInvitationRepository _invitations;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notifications;
    private readonly ApplicationDbContext _db;

    public HorseService(
        IHorseRepository horses,
        IOwnerRepository owners,
        IJockeyRepository jockeys,
        IRaceRepository races,
        IRaceEntryRepository raceEntries,
        IJockeyInvitationRepository invitations,
        IUnitOfWork unitOfWork,
        INotificationService notifications,
        ApplicationDbContext db)
    {
        _horses = horses;
        _owners = owners;
        _jockeys = jockeys;
        _races = races;
        _raceEntries = raceEntries;
        _invitations = invitations;
        _unitOfWork = unitOfWork;
        _notifications = notifications;
        _db = db;
    }

    public async Task<ServiceResult<object>> GetMyHorsesAsync(Guid userId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horses = await _horses.GetByOwnerAsync(owner.Id);
        return ServiceResult<object>.Ok(horses);
    }

    public async Task<ServiceResult<object>> GetHorseAsync(Guid userId, Guid horseId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy ngựa");
        }

        return ServiceResult<object>.Ok(horse);
    }

    public async Task<ServiceResult<object>> CreateHorseAsync(Guid userId, HorseCreateRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var validationError = ValidateHorseStats(request.DateOfBirth, request.Age, request.TotalRaces, request.TotalWins);
        if (validationError != null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, validationError);
        }

        var horse = new Horse
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Breed = request.Breed,
            Gender = request.Gender,
            DateOfBirth = request.DateOfBirth,
            Age = request.Age,
            Weight = request.Weight,
            Height = request.Height,
            Color = request.Color,
            TotalRaces = request.TotalRaces,
            TotalWins = request.TotalWins,
            ImageUrl = request.ImageUrl,
            OwnerId = owner.Id,
            ApprovalStatus = ApprovalStatus.Pending
        };

        await _horses.AddAsync(horse);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(horse);
    }

    public async Task<ServiceResult<object>> UpdateHorseAsync(Guid userId, Guid horseId, HorseUpdateRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy ngựa");
        }

        var validationError = ValidateHorseStats(request.DateOfBirth, request.Age, request.TotalRaces, request.TotalWins);
        if (validationError != null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, validationError);
        }

        horse.Name = request.Name;
        horse.Breed = request.Breed;
        horse.Gender = request.Gender;
        horse.DateOfBirth = request.DateOfBirth;
        horse.Age = request.Age;
        horse.Weight = request.Weight;
        horse.Height = request.Height;
        horse.Color = request.Color;
        horse.TotalRaces = request.TotalRaces;
        horse.TotalWins = request.TotalWins;
        horse.ImageUrl = request.ImageUrl;
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(horse);
    }

    public async Task<ServiceResult<string>> DeleteHorseAsync(Guid userId, Guid horseId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<string>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<string>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy ngựa");
        }

        await RemoveHorseRelatedDataAsync(horse);
        await _horses.RemoveAsync(horse);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<string>.Ok("Đã xóa");
    }

    public async Task<ServiceResult<object>> InviteJockeyAsync(Guid userId, Guid horseId, JockeyInvitationCreateRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy ngựa");
        }

        var invitedJockey = await _jockeys.GetByIdAsync(request.JockeyId);
        if (invitedJockey == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy kỵ sĩ");
        }

        if (invitedJockey.UserId == userId)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "Bạn không thể gửi lời mời cho chính mình");
        }

        var existingInvitation = await _invitations.GetByHorseAndJockeyAsync(horseId, request.JockeyId);
        if (existingInvitation != null)
        {
            if (existingInvitation.Status == JockeyInvitationStatus.Declined)
            {
                existingInvitation.RaceId = request.RaceId;
                existingInvitation.Status = JockeyInvitationStatus.Pending;
                existingInvitation.CreatedAt = DateTime.UtcNow;
                existingInvitation.RespondedAt = null;
                existingInvitation.ResponseNote = null;
            }
            else
            {
                var jockeyName = existingInvitation.Jockey?.User?.FullName ?? "kỵ sĩ khác";
                var status = existingInvitation.Status.ToString().ToLowerInvariant();
                return ServiceResult<object>.Fail(
                    StatusCodes.Status409Conflict,
                    $"Ngựa này đã có kỵ sĩ {jockeyName} với trạng thái {status}");
            }
        }

        var jockeyExists = await _jockeys.ExistsAsync(request.JockeyId);
        if (!jockeyExists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy kỵ sĩ");
        }

        var invitation = existingInvitation ?? new JockeyInvitation
        {
            Id = Guid.NewGuid(),
            HorseId = horseId,
            JockeyId = request.JockeyId,
            RaceId = request.RaceId,
            Status = JockeyInvitationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        if (existingInvitation == null)
        {
            await _invitations.AddAsync(invitation);
        }
        try
        {
            await _unitOfWork.SaveChangesAsync();
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is Npgsql.PostgresException
            {
                SqlState: Npgsql.PostgresErrorCodes.UniqueViolation
            })
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status409Conflict,
                "Lời mời cho ngựa và kỵ sĩ này đã tồn tại");
        }

        await _notifications.CreateNotificationAsync(new CreateNotificationDto
        {
            UserId = invitedJockey.UserId,
            Title = "Bạn có lời mời đua mới",
            Message = $"{owner.User?.FullName ?? "Chủ ngựa"} đã mời bạn làm kỵ sĩ cho ngựa {horse.Name}.",
            Type = NotificationType.InApp,
            Category = NotificationCategory.JockeyInvitation,
            ActionUrl = $"/jockey/invitations/{invitation.Id}",
            RelatedEntityId = invitation.Id,
            RelatedEntityType = nameof(JockeyInvitation)
        });

        return ServiceResult<object>.Ok(invitation);
    }

    public async Task<ServiceResult<object>> RegisterHorseAsync(Guid userId, Guid horseId, Guid raceId, RaceRegistrationRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy ngựa");
        }

        if (horse.ApprovalStatus != ApprovalStatus.Approved)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "Chỉ ngựa đã được phê duyệt mới có thể đăng ký tham gia");
        }

        var raceExists = await _races.ExistsAsync(raceId);
        if (!raceExists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy cuộc đua");
        }

        // Check race is still open for registration
        var race = await _races.GetByIdAsync(raceId);
        if (race == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy cuộc đua");
        }
        if (race.Status != RaceStatus.RegistrationOpen)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, $"Không thể đăng ký vào cuộc đua với trạng thái '{race.Status}'. Cuộc đua phải ở trạng thái Đang mở đăng ký.");
        }

        if (race.Tournament?.RegistrationDeadline is DateTime registrationDeadline &&
            DateTime.UtcNow > registrationDeadline.ToUniversalTime())
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "Đã quá hạn đăng ký của giải đấu");
        }

        var activeEntryCount = race.Entries.Count(entry =>
            entry.Status != RegistrationStatus.Rejected &&
            entry.ScratchedAt == null);
        if (activeEntryCount >= race.MaxParticipants)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status409Conflict,
                $"Cuộc đua đã đủ số lượng tham gia tối đa ({race.MaxParticipants})");
        }

        // Check horse is not already registered for this specific race
        var exists = await _raceEntries.ExistsAsync(raceId, horseId);
        if (exists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status409Conflict, "Ngựa đã được đăng ký");
        }

        // Check: owner chỉ được đăng ký 1 con ngựa vào 1 cuộc đua
        var ownerAlreadyInRace = await _raceEntries.OwnerHasHorseInRaceAsync(raceId, owner.Id);
        if (ownerAlreadyInRace)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Bạn chỉ có thể đăng ký 1 con ngựa vào 1 cuộc đua. Ngựa khác của bạn đã được đăng ký hoặc đang chờ duyệt cho cuộc đua này.");
        }

        var acceptedInvitation = horse.JockeyInvitations
            .Where(invitation => invitation.Status == JockeyInvitationStatus.Accepted)
            .OrderByDescending(invitation => invitation.CreatedAt)
            .FirstOrDefault();
        var registeringJockey = acceptedInvitation == null
            ? await _jockeys.GetByUserIdAsync(userId)
            : null;
        var assignedJockeyId = acceptedInvitation?.JockeyId ?? registeringJockey?.Id;
        if (assignedJockeyId.HasValue &&
            await _raceEntries.IsJockeyInTournamentAsync(assignedJockeyId.Value, race.TournamentId))
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status409Conflict,
                "Kỵ sĩ này đã tham gia một cuộc đua trong cùng giải đấu");
        }

        var entry = new RaceEntry
        {
            Id = Guid.NewGuid(),
            RaceId = raceId,
            HorseId = horseId,
            JockeyId = assignedJockeyId,
            Status = RegistrationStatus.Pending,
            OwnerConfirmed = request.OwnerConfirmed,
            JockeyConfirmed = assignedJockeyId.HasValue
        };

        await _raceEntries.AddAsync(entry);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(entry);
    }

    public async Task<ServiceResult<object>> ConfirmOwnerAsync(Guid userId, Guid raceId, Guid entryId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy hồ sơ chủ sở hữu");
        }

        var entry = await _raceEntries.GetByIdWithHorseAsync(entryId, raceId);
        if (entry?.Horse == null || entry.Horse.OwnerId != owner.Id)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Không tìm thấy đăng ký tham gia");
        }

        entry.OwnerConfirmed = true;
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(entry);
    }

    private async Task RemoveHorseRelatedDataAsync(Horse horse)
    {
        var invitations = await _db.JockeyInvitations.Where(i => i.HorseId == horse.Id).ToListAsync();
        if (invitations.Count > 0)
        {
            _db.JockeyInvitations.RemoveRange(invitations);
        }

        var raceEntries = await _db.RaceEntries.Where(e => e.HorseId == horse.Id).ToListAsync();
        if (raceEntries.Count > 0)
        {
            _db.RaceEntries.RemoveRange(raceEntries);
        }

        var predictions = await _db.Predictions.Where(p => p.PredictedHorseId == horse.Id).ToListAsync();
        if (predictions.Count > 0)
        {
            _db.Predictions.RemoveRange(predictions);
        }

        var healthChecks = await _db.HorseHealthChecks.Where(h => h.HorseId == horse.Id).ToListAsync();
        if (healthChecks.Count > 0)
        {
            _db.HorseHealthChecks.RemoveRange(healthChecks);
        }

        var injuryRecords = await _db.InjuryRecords.Where(i => i.HorseId == horse.Id).ToListAsync();
        if (injuryRecords.Count > 0)
        {
            _db.InjuryRecords.RemoveRange(injuryRecords);
        }

        var contracts = await _db.Contracts.Where(c => c.HorseId == horse.Id).ToListAsync();
        if (contracts.Count > 0)
        {
            _db.Contracts.RemoveRange(contracts);
        }

        var horseTransfers = await _db.HorseTransfers.Where(t => t.HorseId == horse.Id).ToListAsync();
        if (horseTransfers.Count > 0)
        {
            _db.HorseTransfers.RemoveRange(horseTransfers);
        }

        // Keep RaceResults for historical integrity — WinningHorseId will become orphaned but preserves history
    }

    private Task<Owner?> GetOwnerProfileAsync(Guid userId) => _owners.GetByUserIdAsync(userId);

    private static string? ValidateHorseStats(DateTime? dateOfBirth, int age, int totalRaces, int totalWins)
    {
        if (dateOfBirth.HasValue)
        {
            var birthDate = dateOfBirth.Value.Date;
            var today = DateTime.Today;
            if (birthDate > today)
            {
                return "Ngày sinh không thể ở tương lai";
            }

            var expectedAge = today.Year - birthDate.Year;
            if (birthDate > today.AddYears(-expectedAge))
            {
                expectedAge--;
            }

            if (age != expectedAge)
            {
                return $"Tuổi phải là {expectedAge} dựa trên ngày sinh";
            }
        }

        if (totalWins > totalRaces)
        {
            return "Tổng số trận thắng không thể lớn hơn tổng số trận đua";
        }

        return null;
    }
}
