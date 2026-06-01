using System;
using System.Threading.Tasks;
using HorseRacing.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HorseRacing.Data;

public static class AdminSeeder
{
    private const string AdminEmail = "Admin@gmail.com";
    private const string AdminPassword = "Admin123";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            var exists = await db.Users.AnyAsync(u => u.Email == AdminEmail);
            if (exists)
            {
                return;
            }

            var admin = new User
            {
                Id = Guid.NewGuid(),
                Email = AdminEmail,
                FullName = "System Admin",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, AdminPassword);

            db.Users.Add(admin);
            await db.SaveChangesAsync();

            logger.LogInformation("Default admin account created: {Email}", AdminEmail);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not seed default admin account.");
        }
    }
}
