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
            .Where(i => i.JockeyId == jockeyId)
            .ToListAsync();
    }

    public Task<JockeyInvitation?> GetByIdAsync(Guid invitationId, Guid jockeyId)
    {
        return _db.JockeyInvitations.FirstOrDefaultAsync(i => i.Id == invitationId && i.JockeyId == jockeyId);
    }

    public Task AddAsync(JockeyInvitation invitation)
    {
        _db.JockeyInvitations.Add(invitation);
        return Task.CompletedTask;
    }
}
