using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("Horses")]
public class Horse
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int Age { get; set; }

    [Required]
    public Guid OwnerId { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    [MaxLength(1000)]
    public string? ApprovalNote { get; set; }

    public User? Owner { get; set; }

    public ICollection<RaceEntry> RaceEntries { get; set; } = new List<RaceEntry>();
    public ICollection<JockeyInvitation> JockeyInvitations { get; set; } = new List<JockeyInvitation>();
}
