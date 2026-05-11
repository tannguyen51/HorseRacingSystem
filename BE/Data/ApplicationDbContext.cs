using HorseRacing.Models;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Horse> Horses => Set<Horse>();
    public DbSet<Jockey> Jockeys => Set<Jockey>();
    public DbSet<Tournament> Tournaments => Set<Tournament>();
    public DbSet<Race> Races => Set<Race>();
    public DbSet<RaceEntry> RaceEntries => Set<RaceEntry>();
    public DbSet<JockeyInvitation> JockeyInvitations => Set<JockeyInvitation>();
    public DbSet<Prediction> Predictions => Set<Prediction>();
    public DbSet<RaceResult> RaceResults => Set<RaceResult>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Race>()
            .Property(r => r.Status)
            .HasConversion<string>();

        modelBuilder.Entity<RaceEntry>()
            .Property(e => e.Status)
            .HasConversion<string>();

        modelBuilder.Entity<JockeyInvitation>()
            .Property(i => i.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Prediction>()
            .Property(p => p.Status)
            .HasConversion<string>();

        modelBuilder.Entity<User>()
            .HasMany(u => u.Horses)
            .WithOne(h => h.Owner)
            .HasForeignKey(h => h.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.JockeyProfile)
            .WithOne(j => j.User)
            .HasForeignKey<Jockey>(j => j.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Tournament>()
            .HasMany(t => t.Races)
            .WithOne(r => r.Tournament)
            .HasForeignKey(r => r.TournamentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Race>()
            .HasMany(r => r.Entries)
            .WithOne(e => e.Race)
            .HasForeignKey(e => e.RaceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RaceEntry>()
            .HasOne(e => e.Horse)
            .WithMany(h => h.RaceEntries)
            .HasForeignKey(e => e.HorseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RaceEntry>()
            .HasOne(e => e.Jockey)
            .WithMany(j => j.RaceEntries)
            .HasForeignKey(e => e.JockeyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<JockeyInvitation>()
            .HasOne(i => i.Horse)
            .WithMany(h => h.JockeyInvitations)
            .HasForeignKey(i => i.HorseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<JockeyInvitation>()
            .HasOne(i => i.Jockey)
            .WithMany(j => j.Invitations)
            .HasForeignKey(i => i.JockeyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<JockeyInvitation>()
            .HasOne(i => i.Race)
            .WithMany()
            .HasForeignKey(i => i.RaceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Prediction>()
            .HasOne(p => p.Race)
            .WithMany(r => r.Predictions)
            .HasForeignKey(p => p.RaceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Prediction>()
            .HasOne(p => p.PredictedHorse)
            .WithMany()
            .HasForeignKey(p => p.PredictedHorseId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Prediction>()
            .HasOne(p => p.Spectator)
            .WithMany()
            .HasForeignKey(p => p.SpectatorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RaceResult>()
            .HasOne(rr => rr.Race)
            .WithOne(r => r.Result)
            .HasForeignKey<RaceResult>(rr => rr.RaceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<RaceResult>()
            .HasOne(rr => rr.WinningHorse)
            .WithMany()
            .HasForeignKey(rr => rr.WinningHorseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
