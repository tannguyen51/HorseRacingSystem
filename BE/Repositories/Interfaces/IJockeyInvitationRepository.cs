using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IJockeyInvitationRepository
{
    Task<List<JockeyInvitation>> GetByJockeyAsync(Guid jockeyId);
    Task<JockeyInvitation?> GetByIdAsync(Guid invitationId, Guid jockeyId);
    Task AddAsync(JockeyInvitation invitation);
}
