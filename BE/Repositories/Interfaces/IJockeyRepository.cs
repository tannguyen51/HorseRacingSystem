using System;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IJockeyRepository
{
    Task<bool> ExistsAsync(Guid jockeyId);
    Task<Jockey?> GetByIdAsync(Guid jockeyId);
    Task<Jockey?> GetByUserIdAsync(Guid userId);
    Task AddAsync(Jockey jockey);
    Task UpdateAsync(Jockey jockey);
}
