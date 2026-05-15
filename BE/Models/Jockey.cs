using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("Jockeys")]
public class Jockey
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    public User? User { get; set; }

    [MaxLength(100)]
    public string? LicenseNumber { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    [MaxLength(1000)]
    public string? ApprovalNote { get; set; }

    public ICollection<RaceEntry> RaceEntries { get; set; } = new List<RaceEntry>();
    public ICollection<JockeyInvitation> Invitations { get; set; } = new List<JockeyInvitation>();
}
