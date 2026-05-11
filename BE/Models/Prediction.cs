using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("Predictions")]
public class Prediction
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid RaceId { get; set; }

    public Race? Race { get; set; }

    [Required]
    public Guid SpectatorUserId { get; set; }

    public User? Spectator { get; set; }

    [Required]
    public Guid PredictedHorseId { get; set; }

    public Horse? PredictedHorse { get; set; }

    public PredictionStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
}
