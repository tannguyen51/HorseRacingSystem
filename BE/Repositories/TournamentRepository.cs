using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class TournamentRepository : ITournamentRepository
{
    private readonly ApplicationDbContext _db;

    public TournamentRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<List<Tournament>> GetAllWithRacesAsync()
    {
        return _db.Tournaments
            .Include(t => t.Races)
            .ToListAsync();
    }
}
