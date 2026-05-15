using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class RaceManagementService : IRaceManagementService
{
    private readonly IRaceRepository _raceRepo;
    private readonly IRaceEntryRepository _entryRepo;
    private readonly IHorseRepository _horseRepo;
    private readonly IJockeyRepository _jockeyRepo;
    private readonly ITournamentRepository _tournamentRepo;
    private readonly IRoundRepository _roundRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RaceManagementService(
        IRaceRepository raceRepo,
        IRaceEntryRepository entryRepo,
        IHorseRepository horseRepo,
        IJockeyRepository jockeyRepo,
        ITournamentRepository tournamentRepo,
        IRoundRepository roundRepo,
        IUnitOfWork unitOfWork)
    {
        _raceRepo = raceRepo;
        _entryRepo = entryRepo;
        _horseRepo = horseRepo;
        _jockeyRepo = jockeyRepo;
        _tournamentRepo = tournamentRepo;
        _roundRepo = roundRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<RaceDetailResponse>> CreateRaceAsync(CreateRaceRequest request)
    {
        try
        {
            var tournament = await _tournamentRepo.GetByIdAsync(request.TournamentId);
            if (tournament == null)
            {
                return ServiceResult<RaceDetailResponse>.Error("Tournament not found", 404);
            }

            var race = new Race
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                TournamentId = request.TournamentId,
                RoundId = request.RoundId,
                ScheduledAt = request.ScheduledAt,
                Status = RaceStatus.Scheduled,
                Location = request.Location,
                Description = request.Description,
                MaxParticipants = request.MaxParticipants,
                Distance = request.Distance,
                CreatedAt = DateTime.UtcNow
            };

            await _raceRepo.AddAsync(race);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<RaceDetailResponse>(201, ApiResult<RaceDetailResponse>.Ok(MapToDetailResponse(race)));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Error creating race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RaceDetailResponse>> GetRaceDetailsAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<RaceDetailResponse>.Fail(404, "Race not found");
            }

            return ServiceResult<RaceDetailResponse>.Ok(MapToDetailResponse(race));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Error retrieving race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RaceDetailResponse>> UpdateRaceAsync(Guid raceId, UpdateRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<RaceDetailResponse>.Fail(404, "Race not found");
            }

            if (!string.IsNullOrEmpty(request.Name))
                race.Name = request.Name;
            if (request.ScheduledAt.HasValue)
                race.ScheduledAt = request.ScheduledAt.Value;
            if (request.ActualStartTime.HasValue)
                race.ActualStartTime = request.ActualStartTime.Value;
            if (request.ActualEndTime.HasValue)
                race.ActualEndTime = request.ActualEndTime.Value;
            if (!string.IsNullOrEmpty(request.Location))
                race.Location = request.Location;
            if (!string.IsNullOrEmpty(request.Description))
                race.Description = request.Description;
            if (request.MaxParticipants.HasValue)
                race.MaxParticipants = request.MaxParticipants.Value;
            if (request.Distance.HasValue)
                race.Distance = request.Distance.Value;

            race.UpdatedAt = DateTime.UtcNow;
            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<RaceDetailResponse>.Ok(MapToDetailResponse(race));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Error updating race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RaceDetailResponse>>> GetRacesByTournamentAsync(Guid tournamentId)
    {
        try
        {
            var races = await _raceRepo.GetByTournamentAsync(tournamentId);
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Ok(
                races.Select(MapToDetailResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Fail(
                500, $"Error retrieving races: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RaceDetailResponse>>> GetRacesByRoundAsync(Guid roundId)
    {
        try
        {
            var races = await _raceRepo.GetByRoundAsync(roundId);
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Ok(
                races.Select(MapToDetailResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Fail(
                500, $"Error retrieving races: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeleteRaceAsync(Guid raceId)
    {
        try
        {
            await _raceRepo.DeleteAsync(raceId);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error deleting race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> AssignHorseToRaceAsync(Guid raceId, AssignHorseToRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Race not found");
            }
            var horse = await _horseRepo.GetByIdAsync(request.HorseId);
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Horse not found");
            }
            if (horse.ApprovalStatus != ApprovalStatus.Approved)
            {
                return ServiceResult<bool>.Fail(400, "Horse is not approved by admin");
            }
            if (request.JockeyId.HasValue)
            {
                var jockey = await _jockeyRepo.GetByIdAsync(request.JockeyId.Value);
                if (jockey == null)
                {
                    return ServiceResult<bool>.Fail(404, "Jockey not found");
                }
                if (jockey.ApprovalStatus != ApprovalStatus.Approved)
                {
                    return ServiceResult<bool>.Fail(400, "Jockey is not approved by admin");
                }
            }

            var entry = new RaceEntry
            {
                Id = Guid.NewGuid(),
                RaceId = raceId,
                HorseId = request.HorseId,
                JockeyId = request.JockeyId,
                Status = RegistrationStatus.Pending
            };

            await _entryRepo.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<bool>(201, ApiResult<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error assigning horse: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> BulkAssignHorsesToRaceAsync(Guid raceId, BulkAssignHorsesToRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Race not found");
            }

            foreach (var horseId in request.HorseIds)
            {
                var entry = new RaceEntry
                {
                    Id = Guid.NewGuid(),
                    RaceId = raceId,
                    HorseId = horseId,
                    Status = RegistrationStatus.Pending
                };
                await _entryRepo.AddAsync(entry);
            }

            await _unitOfWork.SaveChangesAsync();
            return new ServiceResult<bool>(201, ApiResult<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error bulk assigning horses: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RemoveHorseFromRaceAsync(Guid raceId, Guid horseId)
    {
        try
        {
            var entry = await _entryRepo.GetByRaceAndHorseAsync(raceId, horseId);
            if (entry == null)
            {
                return ServiceResult<bool>.Fail(404, "Race entry not found");
            }

            await _entryRepo.DeleteAsync(entry.Id);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error removing horse: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> StartRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Race not found");
            }

            race.Status = RaceStatus.InProgress;
            race.ActualStartTime = DateTime.UtcNow;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error starting race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> EndRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Race not found");
            }

            race.Status = RaceStatus.Finished;
            race.ActualEndTime = DateTime.UtcNow;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error ending race: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> CancelRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Race not found");
            }

            race.Status = RaceStatus.Cancelled;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error cancelling race: {ex.Message}");
        }
    }

    private RaceDetailResponse MapToDetailResponse(Race race)
    {
        return new RaceDetailResponse
        {
            Id = race.Id,
            Name = race.Name,
            TournamentId = race.TournamentId,
            RoundId = race.RoundId,
            ScheduledAt = race.ScheduledAt,
            ActualStartTime = race.ActualStartTime,
            ActualEndTime = race.ActualEndTime,
            Status = race.Status.ToString(),
            Location = race.Location,
            Description = race.Description,
            MaxParticipants = race.MaxParticipants,
            Distance = race.Distance,
            EntriesCount = race.Entries?.Count ?? 0,
            ActiveRefereesCount = race.RefereeAssignments?.Count(a => a.Status != RefereeAssignmentStatus.Cancelled) ?? 0
        };
    }
}
