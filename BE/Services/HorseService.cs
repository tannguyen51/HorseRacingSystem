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
    private readonly ApplicationDbContext _db;

    public HorseService(
        IHorseRepository horses,
        IOwnerRepository owners,
        IJockeyRepository jockeys,
        IRaceRepository races,
        IRaceEntryRepository raceEntries,
        IJockeyInvitationRepository invitations,
        IUnitOfWork unitOfWork,
        ApplicationDbContext db)
    {
        _horses = horses;
        _owners = owners;
        _jockeys = jockeys;
        _races = races;
        _raceEntries = raceEntries;
        _invitations = invitations;
        _unitOfWork = unitOfWork;
        _db = db;
    }

    public async Task<ServiceResult<object>> GetMyHorsesAsync(Guid userId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horses = await _horses.GetByOwnerAsync(owner.Id);
        return ServiceResult<object>.Ok(horses);
    }

    public async Task<ServiceResult<object>> GetHorseAsync(Guid userId, Guid horseId)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
        }

        return ServiceResult<object>.Ok(horse);
    }

    public async Task<ServiceResult<object>> CreateHorseAsync(Guid userId, HorseCreateRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
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
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
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
            return ServiceResult<string>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<string>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
        }

        await RemoveHorseRelatedDataAsync(horse);
        await _horses.RemoveAsync(horse);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<string>.Ok("Deleted");
    }

    public async Task<ServiceResult<object>> InviteJockeyAsync(Guid userId, Guid horseId, JockeyInvitationCreateRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
        }

        var existingInvitation = await _invitations.GetByHorseAndJockeyAsync(horseId, request.JockeyId);
        if (existingInvitation != null)
        {
            if (existingInvitation.Status == JockeyInvitationStatus.Declined)
            {
                _db.JockeyInvitations.Remove(existingInvitation);
            }
            else
            {
                var jockeyName = existingInvitation.Jockey?.User?.FullName ?? "another jockey";
                var status = existingInvitation.Status.ToString().ToLowerInvariant();
                return ServiceResult<object>.Fail(
                    StatusCodes.Status409Conflict,
                    $"This horse already has a {status} jockey assignment with {jockeyName}.");
            }
        }

        var jockeyExists = await _jockeys.ExistsAsync(request.JockeyId);
        if (!jockeyExists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Jockey not found.");
        }

        var invitation = new JockeyInvitation
        {
            Id = Guid.NewGuid(),
            HorseId = horseId,
            JockeyId = request.JockeyId,
            RaceId = request.RaceId,
            Status = JockeyInvitationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _invitations.AddAsync(invitation);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(invitation);
    }

    public async Task<ServiceResult<object>> RegisterHorseAsync(Guid userId, Guid horseId, Guid raceId, RaceRegistrationRequest request)
    {
        var owner = await GetOwnerProfileAsync(userId);
        if (owner == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var horse = await _horses.GetOwnedHorseAsync(horseId, owner.Id);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
        }

        if (horse.ApprovalStatus != ApprovalStatus.Approved)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status400BadRequest,
                "Only approved horses can be registered for a race.");
        }

        var raceExists = await _races.ExistsAsync(raceId);
        if (!raceExists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Race not found.");
        }

        var exists = await _raceEntries.ExistsAsync(raceId, horseId);
        if (exists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status409Conflict, "Horse already registered.");
        }

        var entry = new RaceEntry
        {
            Id = Guid.NewGuid(),
            RaceId = raceId,
            HorseId = horseId,
            Status = RegistrationStatus.Pending,
            OwnerConfirmed = request.OwnerConfirmed,
            JockeyConfirmed = false
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
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Owner profile not found.");
        }

        var entry = await _raceEntries.GetByIdWithHorseAsync(entryId, raceId);
        if (entry?.Horse == null || entry.Horse.OwnerId != owner.Id)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Entry not found.");
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

        var raceResults = await _db.RaceResults.Where(r => r.WinningHorseId == horse.Id).ToListAsync();
        if (raceResults.Count > 0)
        {
            _db.RaceResults.RemoveRange(raceResults);
        }
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
                return "Date of birth cannot be in the future.";
            }

            var expectedAge = today.Year - birthDate.Year;
            if (birthDate > today.AddYears(-expectedAge))
            {
                expectedAge--;
            }

            if (age != expectedAge)
            {
                return $"Age must be {expectedAge} based on the date of birth.";
            }
        }

        if (totalWins > totalRaces)
        {
            return "Total wins cannot be greater than total races.";
        }

        return null;
    }
}
