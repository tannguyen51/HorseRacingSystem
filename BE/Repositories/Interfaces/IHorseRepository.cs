using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IHorseRepository
{
    Task<List<Horse>> GetByOwnerAsync(Guid ownerId);
    Task<Horse?> GetOwnedHorseAsync(Guid horseId, Guid ownerId);
    Task AddAsync(Horse horse);
    Task RemoveAsync(Horse horse);
}
