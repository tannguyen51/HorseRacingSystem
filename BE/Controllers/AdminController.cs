using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
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
    private readonly IRaceEntryRepository _entryRepo;
    private readonly IUnitOfWork _unitOfWork;

    public AdminController(IAdminService adminService, IRaceEntryRepository entryRepo, IUnitOfWork unitOfWork)
    {
        _adminService = adminService;
        _entryRepo = entryRepo;
        _unitOfWork = unitOfWork;
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
    [HttpGet("users/{userId:guid}/horses")]
    public async Task<ActionResult> GetOwnerHorses(Guid userId)
    {
        var result = await _adminService.GetOwnerHorsesAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("users/{userId:guid}/horses/{horseId:guid}")]
    public async Task<ActionResult> GetOwnerHorse(Guid userId, Guid horseId)
    {
        var result = await _adminService.GetOwnerHorseAsync(userId, horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPut("users/{userId:guid}/horses/{horseId:guid}/status")]
    public async Task<ActionResult> UpdateOwnerHorseStatus(
        Guid userId,
        Guid horseId,
        [FromBody] UpdateHorseApprovalStatusRequest request)
    {
        var result = await _adminService.UpdateOwnerHorseStatusAsync(userId, horseId, request);
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
    public async Task<ActionResult> RejectJockey(Guid jockeyId, [FromBody] RejectJockeyRequest request)
    {
        var reason = string.IsNullOrWhiteSpace(request?.Reason)
            ? "No reason provided"
            : request.Reason.Trim();
        var result = await _adminService.RejectJockeyAsync(jockeyId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Operations
    [HttpPost("races/{raceId:guid}/publish-result")]
    public async Task<ActionResult> PublishRaceResult(Guid raceId, [FromBody] RaceResultRequest request)
    {
        var result = await _adminService.PublishRaceResultAsync(raceId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Race Entry Management
    [HttpGet("race-entries/pending")]
    public async Task<ActionResult> GetPendingRaceEntries()
    {
        var entries = await _entryRepo.GetPendingWithDetailsAsync();
        var result = entries.Select(e => new
        {
            EntryId = e.Id,
            RaceId = e.RaceId,
            RaceName = e.Race?.Name ?? "",
            TournamentName = e.Race?.Tournament?.Name ?? "",
            HorseId = e.HorseId,
            HorseName = e.Horse?.Name ?? "",
            OwnerName = e.Horse?.Owner?.User?.FullName ?? "",
            JockeyName = e.Jockey?.User?.FullName,
            Status = e.Status.ToString(),
            OwnerConfirmed = e.OwnerConfirmed,
            JockeyConfirmed = e.JockeyConfirmed
        });
        return Ok(ApiResult<object>.Ok(result));
    }

    [HttpPost("race-entries/{entryId:guid}/approve")]
    public async Task<ActionResult> ApproveRaceEntry(Guid entryId)
    {
        var entry = await _entryRepo.GetByIdAsync(entryId);
        if (entry == null) return NotFound(new { message = "Entry not found." });
        entry.Status = RegistrationStatus.Approved;
        await _entryRepo.UpdateAsync(entry);
        await _unitOfWork.SaveChangesAsync();
        return Ok(new { message = "Đã phê duyệt." });
    }

    [HttpPost("race-entries/{entryId:guid}/reject")]
    public async Task<ActionResult> RejectRaceEntry(Guid entryId, [FromBody] EntryRejectRequest request)
    {
        var entry = await _entryRepo.GetByIdAsync(entryId);
        if (entry == null) return NotFound(new { message = "Entry not found." });
        entry.Status = RegistrationStatus.Rejected;
        entry.ScratchedAt = DateTime.UtcNow;
        entry.ScratchReason = request?.Reason ?? "Bị từ chối bởi admin";
        await _entryRepo.UpdateAsync(entry);
        await _unitOfWork.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối." });
    }
}

public class EntryRejectRequest { public string? Reason { get; set; } }
