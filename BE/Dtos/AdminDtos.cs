using System;

namespace HorseRacing.Dtos;

// User Registration DTOs
public class SubmitRegistrationRequest
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RequestedRole { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DocumentUrl { get; set; }
}

public class ApproveRegistrationRequest
{
    public Guid RegistrationId { get; set; }
    public string Password { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
}

public class RejectRegistrationRequest
{
    public Guid RegistrationId { get; set; }
    public string RejectionReason { get; set; } = string.Empty;
    public string? AdminNotes { get; set; }
}

public class UserRegistrationResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RequestedRole { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DocumentUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByUserName { get; set; }
    public string? RejectionReason { get; set; }
    public string? AdminNotes { get; set; }
}

// Admin Dashboard DTOs
public class AdminDashboardResponse
{
    public int TotalUsers { get; set; }
    public int TotalReferees { get; set; }
    public int ActiveTournaments { get; set; }
    public int UpcomingRaces { get; set; }
    public int PendingRegistrations { get; set; }
    public int OngoingRaces { get; set; }
}

public class UserManagementResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Role { get; set; } = string.Empty;
    public int HorseCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Live Race Result DTOs
public class LiveRaceResultResponse
{
    public Guid RaceId { get; set; }
    public string RaceName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? ActualStartTime { get; set; }
    public int TotalParticipants { get; set; }
    public int FinishedCount { get; set; }
    public RaceTimingData? TimingData { get; set; }
    public CurrentPositionData[]? CurrentPositions { get; set; }
}

public class RaceTimingData
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public double? Duration { get; set; }
}

public class CurrentPositionData
{
    public int Position { get; set; }
    public Guid HorseId { get; set; }
    public string HorseName { get; set; } = string.Empty;
    public Guid? JockeyId { get; set; }
    public string? JockeyName { get; set; }
    public string Status { get; set; } = string.Empty; // Finished, Running, Disqualified
    public double? TimeTaken { get; set; }
}

public class RaceRankingResponse
{
    public Guid RaceId { get; set; }
    public string RaceName { get; set; } = string.Empty;
    public DateTime RaceDate { get; set; }
    public RankingEntry[]? Rankings { get; set; }
}

public class RankingEntry
{
    public int Position { get; set; }
    public Guid HorseId { get; set; }
    public string HorseName { get; set; } = string.Empty;
    public Guid? JockeyId { get; set; }
    public string? JockeyName { get; set; }
    public double? TimeTaken { get; set; }
    public bool Won { get; set; }
}
