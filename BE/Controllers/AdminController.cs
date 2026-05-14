using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // Dashboard
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        var result = await _adminService.GetDashboardAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    // User Management
    [HttpGet("users")]
    public async Task<ActionResult> GetAllUsers()
    {
        var result = await _adminService.GetAllUsersAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("users/{userId:guid}")]
    public async Task<ActionResult> GetUser(Guid userId)
    {
        var result = await _adminService.GetUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("users/{userId:guid}/deactivate")]
    public async Task<ActionResult> DeactivateUser(Guid userId)
    {
        var result = await _adminService.DeactivateUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("users/{userId:guid}/reactivate")]
    public async Task<ActionResult> ReactivateUser(Guid userId)
    {
        var result = await _adminService.ReactivateUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    // User Registration Management
    [HttpGet("registrations")]
    public async Task<ActionResult> GetAllRegistrations()
    {
        var result = await _adminService.GetAllRegistrationsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("registrations/pending")]
    public async Task<ActionResult> GetPendingRegistrations()
    {
        var result = await _adminService.GetPendingRegistrationsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("registrations/{id:guid}")]
    public async Task<ActionResult> GetRegistration(Guid id)
    {
        var result = await _adminService.GetRegistrationAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("registrations/{id:guid}/approve")]
    public async Task<ActionResult> ApproveRegistration(Guid id, [FromBody] ApproveRegistrationRequest request)
    {
        request.RegistrationId = id;
        var result = await _adminService.ApproveRegistrationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("registrations/{id:guid}/reject")]
    public async Task<ActionResult> RejectRegistration(Guid id, [FromBody] RejectRegistrationRequest request)
    {
        request.RegistrationId = id;
        var result = await _adminService.RejectRegistrationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Horse Management
    [HttpPost("horses/{horseId:guid}/approve")]
    public async Task<ActionResult> ApproveHorse(Guid horseId)
    {
        var result = await _adminService.ApproveHorseAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("horses/{horseId:guid}/reject")]
    public async Task<ActionResult> RejectHorse(Guid horseId, [FromBody] dynamic request)
    {
        var reason = request?.reason?.ToString() ?? "No reason provided";
        var result = await _adminService.RejectHorseAsync(horseId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Jockey Management
    [HttpPost("jockeys/{jockeyId:guid}/approve")]
    public async Task<ActionResult> ApproveJockey(Guid jockeyId)
    {
        var result = await _adminService.ApproveJockeyAsync(jockeyId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("jockeys/{jockeyId:guid}/reject")]
    public async Task<ActionResult> RejectJockey(Guid jockeyId, [FromBody] dynamic request)
    {
        var reason = request?.reason?.ToString() ?? "No reason provided";
        var result = await _adminService.RejectJockeyAsync(jockeyId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Operations
    [HttpPost("referees/assign")]
    public async Task<ActionResult> AssignReferee([FromBody] AssignRefereeRequest request)
    {
        var result = await _adminService.AssignRefereeToRaceAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("races/{raceId:guid}/publish-result")]
    public async Task<ActionResult> PublishRaceResult(Guid raceId, [FromBody] RaceResultRequest request)
    {
        var result = await _adminService.PublishRaceResultAsync(raceId, request);
        return StatusCode(result.StatusCode, result.Result);
    }
}
