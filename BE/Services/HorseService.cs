using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

public class HorseService : IHorseService
{
    private readonly IHorseRepository _horses;
    private readonly IJockeyRepository _jockeys;
    private readonly IRaceRepository _races;
    private readonly IRaceEntryRepository _raceEntries;
    private readonly IJockeyInvitationRepository _invitations;
    private readonly IUnitOfWork _unitOfWork;

    public HorseService(
        IHorseRepository horses,
        IJockeyRepository jockeys,
        IRaceRepository races,
        IRaceEntryRepository raceEntries,
        IJockeyInvitationRepository invitations,
        IUnitOfWork unitOfWork)
    {
        _horses = horses;
        _jockeys = jockeys;
        _races = races;
        _raceEntries = raceEntries;
        _invitations = invitations;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<object>> GetMyHorsesAsync(Guid ownerId)
    {
        var horses = await _horses.GetByOwnerAsync(ownerId);
        return ServiceResult<object>.Ok(horses);
    }

    public async Task<ServiceResult<object>> CreateHorseAsync(Guid ownerId, HorseCreateRequest request)
    {
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
            OwnerId = ownerId,
            ApprovalStatus = ApprovalStatus.Pending
        };

        await _horses.AddAsync(horse);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(horse);
    }

    public async Task<ServiceResult<object>> UpdateHorseAsync(Guid ownerId, Guid horseId, HorseUpdateRequest request)
    {
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
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

    public async Task<ServiceResult<string>> DeleteHorseAsync(Guid ownerId, Guid horseId)
    {
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);
        if (horse == null)
        {
            return ServiceResult<string>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
        }

        await _horses.RemoveAsync(horse);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<string>.Ok("Deleted");
    }

    public async Task<ServiceResult<object>> InviteJockeyAsync(Guid ownerId, Guid horseId, JockeyInvitationCreateRequest request)
    {
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
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

    public async Task<ServiceResult<object>> RegisterHorseAsync(Guid ownerId, Guid horseId, Guid raceId, RaceRegistrationRequest request)
    {
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);
        if (horse == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Horse not found.");
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

    public async Task<ServiceResult<object>> ConfirmOwnerAsync(Guid ownerId, Guid raceId, Guid entryId)
    {
        var entry = await _raceEntries.GetByIdWithHorseAsync(entryId, raceId);
        if (entry?.Horse == null || entry.Horse.OwnerId != ownerId)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Entry not found.");
        }

        entry.OwnerConfirmed = true;
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(entry);
    }
}
