using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HorseRacing.Models;

[Table("Tournaments")]
public class Tournament
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; } // Grade 1, Grade 2, Listed, etc.

    [MaxLength(200)]
    public string? Venue { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    public SurfaceType? SurfaceType { get; set; }

    public int MaxRounds { get; set; } = 1;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PrizePool { get; set; } = 0;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Round> Rounds { get; set; } = new List<Round>();
    public ICollection<Race> Races { get; set; } = new List<Race>();
}
