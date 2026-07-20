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

    public async Task<List<Horse>> GetByOwnerAsync(Guid ownerId)
    {
        var horses = await _db.Horses
            .Include(h => h.JockeyInvitations)
                .ThenInclude(i => i.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Race)
                    .ThenInclude(r => r.Tournament)
            .Where(h => h.OwnerId == ownerId)
            .ToListAsync();

        foreach (var horse in horses)
        {
            NormalizeHorseInvitations(horse);
        }

        return horses;
    }

    public async Task<Horse?> GetByIdAsync(Guid horseId)
    {
        var horse = await _db.Horses
            .Include(h => h.Owner)
                .ThenInclude(o => o!.User)
            .Include(h => h.JockeyInvitations)
                .ThenInclude(i => i.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Race)
                    .ThenInclude(r => r.Tournament)
            .FirstOrDefaultAsync(h => h.Id == horseId);

        if (horse != null)
        {
            NormalizeHorseInvitations(horse);
        }

        return horse;
    }

    public async Task<Horse?> GetOwnedHorseAsync(Guid horseId, Guid ownerId)
    {
        var horse = await _db.Horses
            .Include(h => h.JockeyInvitations)
                .ThenInclude(i => i.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Jockey)
                    .ThenInclude(j => j!.User)
            .Include(h => h.RaceEntries)
                .ThenInclude(e => e.Race)
                    .ThenInclude(r => r.Tournament)
            .FirstOrDefaultAsync(h => h.Id == horseId && h.OwnerId == ownerId);

        if (horse != null)
        {
            NormalizeHorseInvitations(horse);
        }

        return horse;
    }

    public Task AddAsync(Horse horse)
    {
        _db.Horses.Add(horse);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Horse horse)
    {
        _db.Horses.Update(horse);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Horse horse)
    {
        _db.Horses.Remove(horse);
        return Task.CompletedTask;
    }

    private static void NormalizeHorseInvitations(Horse horse)
    {
        var filtered = horse.JockeyInvitations
            .Where(i => i.Status != JockeyInvitationStatus.Declined)
            .GroupBy(i => i.JockeyId)
            .Select(g => g.OrderByDescending(i => i.CreatedAt).First())
            .OrderByDescending(i => i.CreatedAt)
            .ToList();

        horse.JockeyInvitations.Clear();
        foreach (var invitation in filtered)
        {
            horse.JockeyInvitations.Add(invitation);
        }
    }
}
