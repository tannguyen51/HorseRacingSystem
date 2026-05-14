using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("RaceResults")]
public class RaceResult
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid RaceId { get; set; }

    public Race? Race { get; set; }

    [Required]
    public Guid WinningHorseId { get; set; }

    public Horse? WinningHorse { get; set; }

    public DateTime RecordedAt { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
