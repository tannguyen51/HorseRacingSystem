using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class RaceRepository : IRaceRepository
{
    private readonly ApplicationDbContext _db;

    public RaceRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExistsAsync(Guid raceId)
    {
        return _db.Races.AnyAsync(r => r.Id == raceId);
    }

    public Task<List<Race>> GetAllAsync()
    {
        return _db.Races.ToListAsync();
    }

    public Task<Race?> GetByIdAsync(Guid raceId)
    {
        return _db.Races.FirstOrDefaultAsync(r => r.Id == raceId);
    }

    public Task<Race?> GetByIdWithEntriesAsync(Guid raceId)
    {
        return _db.Races
            .Include(r => r.Entries)
            .ThenInclude(e => e.Horse)
            .FirstOrDefaultAsync(r => r.Id == raceId);
    }
}
