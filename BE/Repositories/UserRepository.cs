using System;
using System.Collections.Generic;
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

    public Task<User?> GetByIdAsync(Guid userId)
    {
        return _db.Users
            .Include(u => u.Horses)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public Task<List<User>> GetAllAsync()
    {
        return _db.Users
            .Include(u => u.Horses)
            .ToListAsync();
    }

    public Task AddAsync(User user)
    {
        _db.Users.Add(user);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        return Task.CompletedTask;
    }
}
