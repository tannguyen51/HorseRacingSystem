using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class JockeyInvitationRepository : IJockeyInvitationRepository
{
    private readonly ApplicationDbContext _db;

    public JockeyInvitationRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<List<JockeyInvitation>> GetByJockeyAsync(Guid jockeyId)
    {
        return _db.JockeyInvitations
            .Include(i => i.Horse)
            .Include(i => i.Race)
            .Where(i =>
                i.JockeyId == jockeyId &&
                i.Status == JockeyInvitationStatus.Pending)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    public Task<JockeyInvitation?> GetByIdAsync(Guid invitationId, Guid jockeyId)
    {
        return _db.JockeyInvitations.FirstOrDefaultAsync(i => i.Id == invitationId && i.JockeyId == jockeyId);
    }

    public Task<JockeyInvitation?> GetActiveByHorseAsync(Guid horseId)
    {
        return _db.JockeyInvitations
            .Include(i => i.Jockey)
                .ThenInclude(j => j!.User)
            .Where(i =>
                i.HorseId == horseId &&
                (i.Status == JockeyInvitationStatus.Pending ||
                 i.Status == JockeyInvitationStatus.Accepted))
            .OrderByDescending(i => i.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public Task AddAsync(JockeyInvitation invitation)
    {
        _db.JockeyInvitations.Add(invitation);
        return Task.CompletedTask;
    }
}
