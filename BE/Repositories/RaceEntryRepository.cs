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
        return _db.RaceEntries
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .FirstOrDefaultAsync(e => e.RaceId == raceId && e.HorseId == horseId);
    }

    public Task<RaceEntry?> GetByRaceAndHorseAsync(Guid raceId, Guid horseId)
    {
        return _db.RaceEntries
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .FirstOrDefaultAsync(e => e.RaceId == raceId && e.HorseId == horseId);
    }

    public Task<List<RaceEntry>> GetByJockeyAsync(Guid jockeyId)
    {
        return _db.RaceEntries
            .Include(e => e.Race)
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .Where(e => e.JockeyId == jockeyId)
            .ToListAsync();
    }

    public Task<List<RaceEntry>> GetByHorseAsync(Guid horseId)
    {
        return _db.RaceEntries
            .Include(e => e.Race)
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .Where(e => e.HorseId == horseId)
            .ToListAsync();
    }

    public Task<List<RaceEntry>> GetByRaceAsync(Guid raceId)
    {
        return _db.RaceEntries
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .Where(e => e.RaceId == raceId)
            .ToListAsync();
    }

    public async Task<RaceEntry?> GetByIdAsync(Guid id)
    {
        return await _db.RaceEntries
            .Include(e => e.Race)
            .Include(e => e.Horse)
            .Include(e => e.Jockey)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public Task AddAsync(RaceEntry entry)
    {
        _db.RaceEntries.Add(entry);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(RaceEntry entry)
    {
        _db.RaceEntries.Update(entry);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id)
    {
        var entry = await GetByIdAsync(id);
        if (entry != null)
        {
            _db.RaceEntries.Remove(entry);
        }
    }
}

