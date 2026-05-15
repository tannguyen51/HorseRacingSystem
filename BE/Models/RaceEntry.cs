using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("RaceEntries")]
public class RaceEntry
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid RaceId { get; set; }

    public Race? Race { get; set; }

    [Required]
    public Guid HorseId { get; set; }

    public Horse? Horse { get; set; }

    public Guid? JockeyId { get; set; }

    public Jockey? Jockey { get; set; }

    public RegistrationStatus Status { get; set; }

    public bool OwnerConfirmed { get; set; }

    public bool JockeyConfirmed { get; set; }
}
