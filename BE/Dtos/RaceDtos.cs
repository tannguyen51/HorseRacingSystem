using System;

namespace HorseRacing.Dtos;

public class RaceSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid TournamentId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

// Additional Race DTOs for BE2
public class CreateRaceRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid TournamentId { get; set; }
    public Guid? RoundId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public int MaxParticipants { get; set; } = 12;
    public int Distance { get; set; } = 2000;
}

public class UpdateRaceRequest
{
    public string? Name { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public int? MaxParticipants { get; set; }
    public int? Distance { get; set; }
}

public class RaceDetailResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid TournamentId { get; set; }
    public Guid? RoundId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public int MaxParticipants { get; set; }
    public int Distance { get; set; }
    public int EntriesCount { get; set; }
    public int ActiveRefereesCount { get; set; }
}

public class AssignHorseToRaceRequest
{
    public Guid HorseId { get; set; }
    public Guid? JockeyId { get; set; }
}

public class BulkAssignHorsesToRaceRequest
{
    public Guid[] HorseIds { get; set; } = Array.Empty<Guid>();
}
