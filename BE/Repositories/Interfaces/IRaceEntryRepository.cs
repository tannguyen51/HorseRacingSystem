using System;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IRaceEntryRepository
{
    Task<bool> ExistsAsync(Guid raceId, Guid horseId);
    Task<RaceEntry?> GetByIdWithHorseAsync(Guid entryId, Guid raceId);
    Task<RaceEntry?> GetByRaceHorseAsync(Guid raceId, Guid horseId);
    Task<System.Collections.Generic.List<RaceEntry>> GetByJockeyAsync(Guid jockeyId);
    Task AddAsync(RaceEntry entry);
}
