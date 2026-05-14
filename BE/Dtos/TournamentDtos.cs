using System;

namespace HorseRacing.Dtos;

// Tournament DTOs
public class CreateTournamentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class UpdateTournamentRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsActive { get; set; }
}

public class TournamentResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public int RoundCount { get; set; }
    public int RaceCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// Round DTOs
public class CreateRoundRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid TournamentId { get; set; }
    public int RoundNumber { get; set; }
    public DateTime ScheduledStartDate { get; set; }
    public DateTime ScheduledEndDate { get; set; }
    public string? Description { get; set; }
}

public class UpdateRoundRequest
{
    public string? Name { get; set; }
    public int? RoundNumber { get; set; }
    public DateTime? ScheduledStartDate { get; set; }
    public DateTime? ScheduledEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public string? Description { get; set; }
}

public class RoundResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid TournamentId { get; set; }
    public int RoundNumber { get; set; }
    public DateTime ScheduledStartDate { get; set; }
    public DateTime ScheduledEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public string? Description { get; set; }
    public int RaceCount { get; set; }
}
