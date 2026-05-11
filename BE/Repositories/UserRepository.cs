using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _db;

    public UserRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<bool> EmailExistsAsync(string email)
    {
        return _db.Users.AnyAsync(u => u.Email == email);
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        return _db.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public Task AddAsync(User user)
    {
        _db.Users.Add(user);
        return Task.CompletedTask;
    }
}
