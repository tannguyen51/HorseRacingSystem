using System;
using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class JockeyRepository : IJockeyRepository
{
    private readonly ApplicationDbContext _db;

    public JockeyRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<bool> ExistsAsync(Guid jockeyId)
    {
        return _db.Jockeys.AnyAsync(j => j.Id == jockeyId);
    }

    public Task<Jockey?> GetByUserIdAsync(Guid userId)
    {
        return _db.Jockeys.FirstOrDefaultAsync(j => j.UserId == userId);
    }

    public Task AddAsync(Jockey jockey)
    {
        _db.Jockeys.Add(jockey);
        return Task.CompletedTask;
    }
}
