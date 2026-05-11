using System;
using System.ComponentModel.DataAnnotations;

namespace HorseRacing.Dtos;

public class HorseCreateRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int Age { get; set; }
}

public class HorseUpdateRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public int Age { get; set; }
}

public class JockeyInvitationCreateRequest
{
    [Required]
    public Guid JockeyId { get; set; }

    public Guid? RaceId { get; set; }
}

public class RaceRegistrationRequest
{
    public bool OwnerConfirmed { get; set; } = true;
}
