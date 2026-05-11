using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IPredictionRepository
{
    Task<bool> ExistsAsync(Guid raceId, Guid spectatorUserId);
    Task AddAsync(Prediction prediction);
    Task<List<Prediction>> GetByUserAsync(Guid spectatorUserId);
}
