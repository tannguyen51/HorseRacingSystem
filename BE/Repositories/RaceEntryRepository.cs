using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class RaceEntryRepository : IRaceEntryRepository
{
    private readonly ApplicationDbContext _db;

    public RaceEntryRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExistsAsync(Guid raceId, Guid horseId)
    {
        return _db.RaceEntries.AnyAsync(e => e.RaceId == raceId && e.HorseId == horseId);
    }

    public Task<RaceEntry?> GetByIdWithHorseAsync(Guid entryId, Guid raceId)
    {
        return _db.RaceEntries
            .Include(e => e.Horse)
            .FirstOrDefaultAsync(e => e.Id == entryId && e.RaceId == raceId);
    }

    public Task<RaceEntry?> GetByRaceHorseAsync(Guid raceId, Guid horseId)
    {
        return _db.RaceEntries.FirstOrDefaultAsync(e => e.RaceId == raceId && e.HorseId == horseId);
    }

    public Task<List<RaceEntry>> GetByJockeyAsync(Guid jockeyId)
    {
        return _db.RaceEntries
            .Include(e => e.Race)
            .Include(e => e.Horse)
            .Where(e => e.JockeyId == jockeyId)
            .ToListAsync();
    }

    public Task AddAsync(RaceEntry entry)
    {
        _db.RaceEntries.Add(entry);
        return Task.CompletedTask;
    }
}
