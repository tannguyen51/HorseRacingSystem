using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface ITournamentRepository
{
    Task<List<Tournament>> GetAllWithRacesAsync();
}
