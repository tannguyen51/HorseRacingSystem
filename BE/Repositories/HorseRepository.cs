using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class HorseRepository : IHorseRepository
{
    private readonly ApplicationDbContext _db;

    public HorseRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<List<Horse>> GetByOwnerAsync(Guid ownerId)
    {
        return _db.Horses.Where(h => h.OwnerId == ownerId).ToListAsync();
    }

    public Task<Horse?> GetOwnedHorseAsync(Guid horseId, Guid ownerId)
    {
        return _db.Horses.FirstOrDefaultAsync(h => h.Id == horseId && h.OwnerId == ownerId);
    }

    public Task AddAsync(Horse horse)
    {
        _db.Horses.Add(horse);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Horse horse)
    {
        _db.Horses.Remove(horse);
        return Task.CompletedTask;
    }
}
