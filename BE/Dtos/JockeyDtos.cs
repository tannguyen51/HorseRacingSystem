using System.ComponentModel.DataAnnotations;

namespace HorseRacing.Dtos;

public class JockeyInvitationRespondRequest
{
    [Required]
    public bool Accept { get; set; }
}
