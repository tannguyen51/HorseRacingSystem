using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/jockeys")]
[Authorize(Roles = "Jockey")]
public class JockeysController : ControllerBase
{
    private readonly IJockeyService _jockeyService;

    public JockeysController(IJockeyService jockeyService)
    {
        _jockeyService = jockeyService;
    }

    [HttpGet("invitations")]
    public async Task<ActionResult> GetInvitations()
    {
        var userId = GetUserId();
        var result = await _jockeyService.GetInvitationsAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("invitations/{id:guid}/respond")]
    public async Task<ActionResult> RespondInvitation(Guid id, JockeyInvitationRespondRequest request)
    {
        var userId = GetUserId();
        var result = await _jockeyService.RespondInvitationAsync(userId, id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("races")]
    public async Task<ActionResult> GetAssignedRaces()
    {
        var userId = GetUserId();
        var result = await _jockeyService.GetAssignedRacesAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return userIdValue == null ? Guid.Empty : Guid.Parse(userIdValue);
    }
}
