using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class PredictionRepository : IPredictionRepository
{
    private readonly ApplicationDbContext _db;

    public PredictionRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExistsAsync(Guid raceId, Guid spectatorUserId)
    {
        return _db.Predictions.AnyAsync(p => p.RaceId == raceId && p.SpectatorUserId == spectatorUserId);
    }

    public Task AddAsync(Prediction prediction)
    {
        _db.Predictions.Add(prediction);
        return Task.CompletedTask;
    }

    public Task<List<Prediction>> GetByUserAsync(Guid spectatorUserId)
    {
        return _db.Predictions
            .Include(p => p.Race)
            .Include(p => p.PredictedHorse)
            .Where(p => p.SpectatorUserId == spectatorUserId)
            .ToListAsync();
    }
}
