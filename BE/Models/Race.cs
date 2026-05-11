using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("Races")]
public class Race
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public Guid TournamentId { get; set; }

    public Tournament? Tournament { get; set; }

    public DateTime ScheduledAt { get; set; }

    public RaceStatus Status { get; set; }

    public ICollection<RaceEntry> Entries { get; set; } = new List<RaceEntry>();
    public RaceResult? Result { get; set; }
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
