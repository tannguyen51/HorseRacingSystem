using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Tests;

public class RaceEntryRepositoryTournamentTests
{
    [Fact]
    public async Task IsJockeyInTournamentAsync_ReturnsTrue_ForSameTournament()
    {
        await using var fixture = await RepositoryFixture.CreateAsync();

        Assert.True(await fixture.Repository.IsJockeyInTournamentAsync(
            fixture.JockeyId,
            fixture.TournamentId));
    }

    [Fact]
    public async Task IsJockeyInTournamentAsync_ReturnsFalse_ForDifferentTournament()
    {
        await using var fixture = await RepositoryFixture.CreateAsync();

        Assert.False(await fixture.Repository.IsJockeyInTournamentAsync(
            fixture.JockeyId,
            Guid.NewGuid()));
    }

    [Fact]
    public async Task IsJockeyInTournamentAsync_IgnoresRejectedAndExcludedEntries()
    {
        await using var fixture = await RepositoryFixture.CreateAsync(RegistrationStatus.Rejected);

        Assert.False(await fixture.Repository.IsJockeyInTournamentAsync(
            fixture.JockeyId,
            fixture.TournamentId));

        fixture.Entry.Status = RegistrationStatus.Pending;
        await fixture.Db.SaveChangesAsync();

        Assert.False(await fixture.Repository.IsJockeyInTournamentAsync(
            fixture.JockeyId,
            fixture.TournamentId,
            fixture.Entry.Id));
    }

    private sealed class RepositoryFixture : IAsyncDisposable
    {
        private RepositoryFixture(
            SqliteConnection connection,
            ApplicationDbContext db,
            RaceEntry entry,
            Guid jockeyId,
            Guid tournamentId)
        {
            Connection = connection;
            Db = db;
            Entry = entry;
            JockeyId = jockeyId;
            TournamentId = tournamentId;
            Repository = new RaceEntryRepository(db);
        }

        public SqliteConnection Connection { get; }
        public ApplicationDbContext Db { get; }
        public RaceEntry Entry { get; }
        public Guid JockeyId { get; }
        public Guid TournamentId { get; }
        public RaceEntryRepository Repository { get; }

        public static async Task<RepositoryFixture> CreateAsync(
            RegistrationStatus status = RegistrationStatus.Pending)
        {
            var connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(connection)
                .Options;
            var db = new ApplicationDbContext(options);
            await db.Database.EnsureCreatedAsync();
            await db.Database.ExecuteSqlRawAsync("PRAGMA foreign_keys = OFF;");

            var tournamentId = Guid.NewGuid();
            var raceId = Guid.NewGuid();
            var jockeyId = Guid.NewGuid();
            var entry = new RaceEntry
            {
                Id = Guid.NewGuid(),
                RaceId = raceId,
                HorseId = Guid.NewGuid(),
                JockeyId = jockeyId,
                Status = status
            };

            db.Races.Add(new Race
            {
                Id = raceId,
                Name = "Race 1",
                TournamentId = tournamentId,
                Status = RaceStatus.Scheduled
            });
            db.RaceEntries.Add(entry);
            await db.SaveChangesAsync();

            return new RepositoryFixture(connection, db, entry, jockeyId, tournamentId);
        }

        public async ValueTask DisposeAsync()
        {
            await Db.DisposeAsync();
            await Connection.DisposeAsync();
        }
    }
}
