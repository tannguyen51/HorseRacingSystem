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
    private static readonly string AdminPassword =
        Environment.GetEnvironmentVariable("DEFAULT_ADMIN_PASSWORD") ?? string.Empty;

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            var normalizedAdminEmail = AdminEmail.ToLowerInvariant();
            var admin = await db.Users.FirstOrDefaultAsync(
                u => u.Email.ToLower() == normalizedAdminEmail);

            if (admin == null)
            {
                admin = new User
                {
                    Id = Guid.NewGuid(),
                    CreatedAt = DateTime.UtcNow
                };
                db.Users.Add(admin);
            }

            admin.Email = AdminEmail;
            admin.FullName = "System Admin";
            admin.Role = UserRole.Admin;
            admin.IsActive = true;
            admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, AdminPassword);

            await db.SaveChangesAsync();

            logger.LogInformation("Default admin account ensured: {Email}", AdminEmail);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not seed default admin account.");
        }
    }
}
