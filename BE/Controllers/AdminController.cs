using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API Controller for administrative operations in the horse racing system.
/// Provides endpoints for managing users, registrations, horses, jockeys, referees, and race operations.
/// All endpoints in this controller require Admin role authorization.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    /// <summary>
    /// Service for handling administrative business logic including user management,
    /// registration approvals, horse/jockey approvals, and race operations.
    /// </summary>
    private readonly IAdminService _adminService;

    /// <summary>
    /// Initializes a new instance of the AdminController class.
    /// </summary>
    /// <param name="adminService">The admin service for administrative operations.</param>
    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    #region Dashboard

    /// <summary>
    /// Retrieves the admin dashboard with system statistics and overview information.
    /// </summary>
    /// <returns>Dashboard data with system metrics and status information.</returns>
    [HttpGet("dashboard")]
    public async Task<ActionResult> GetDashboard()
    {
        var result = await _adminService.GetDashboardAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region User Management

    /// <summary>
    /// Retrieves all users in the system with their details and statuses.
    /// </summary>
    /// <returns>A list of all users in the system.</returns>
    [HttpGet("users")]
    public async Task<ActionResult> GetAllUsers()
    {
        var result = await _adminService.GetAllUsersAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific user by their ID.
    /// </summary>
    /// <param name="userId">The ID of the user to retrieve.</param>
    /// <returns>The user's detailed information.</returns>
    [HttpGet("users/{userId:guid}")]
    public async Task<ActionResult> GetUser(Guid userId)
    {
        var result = await _adminService.GetUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Deactivates a user account, preventing them from accessing the system.
    /// </summary>
    /// <param name="userId">The ID of the user to deactivate.</param>
    /// <returns>Confirmation of user deactivation.</returns>
    [HttpPost("users/{userId:guid}/deactivate")]
    public async Task<ActionResult> DeactivateUser(Guid userId)
    {
        var result = await _adminService.DeactivateUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Reactivates a previously deactivated user account.
    /// </summary>
    /// <param name="userId">The ID of the user to reactivate.</param>
    /// <returns>Confirmation of user reactivation.</returns>
    [HttpPost("users/{userId:guid}/reactivate")]
    public async Task<ActionResult> ReactivateUser(Guid userId)
    {
        var result = await _adminService.ReactivateUserAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region User Registration Management

    /// <summary>
    /// Retrieves all user registrations (both approved and pending).
    /// </summary>
    /// <returns>A list of all registrations in the system.</returns>
    [HttpGet("registrations")]
    public async Task<ActionResult> GetAllRegistrations()
    {
        var result = await _adminService.GetAllRegistrationsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves only pending user registrations awaiting admin approval.
    /// </summary>
    /// <returns>A list of pending registrations.</returns>
    [HttpGet("registrations/pending")]
    public async Task<ActionResult> GetPendingRegistrations()
    {
        var result = await _adminService.GetPendingRegistrationsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific registration by its ID.
    /// </summary>
    /// <param name="id">The ID of the registration to retrieve.</param>
    /// <returns>The registration details.</returns>
    [HttpGet("registrations/{id:guid}")]
    public async Task<ActionResult> GetRegistration(Guid id)
    {
        var result = await _adminService.GetRegistrationAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Approves a pending user registration, activating the user account.
    /// </summary>
    /// <param name="id">The ID of the registration to approve.</param>
    /// <param name="request">The approval request containing registration ID and approval details.</param>
    /// <returns>Confirmation of registration approval and user activation.</returns>
    [HttpPost("registrations/{id:guid}/approve")]
    public async Task<ActionResult> ApproveRegistration(Guid id, [FromBody] ApproveRegistrationRequest request)
    {
        // Ensure the request contains the correct registration ID
        request.RegistrationId = id;
        var result = await _adminService.ApproveRegistrationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Rejects a pending user registration, denying access to the system.
    /// </summary>
    /// <param name="id">The ID of the registration to reject.</param>
    /// <param name="request">The rejection request containing rejection reason.</param>
    /// <returns>Confirmation of registration rejection.</returns>
    [HttpPost("registrations/{id:guid}/reject")]
    public async Task<ActionResult> RejectRegistration(Guid id, [FromBody] RejectRegistrationRequest request)
    {
        // Ensure the request contains the correct registration ID
        request.RegistrationId = id;
        var result = await _adminService.RejectRegistrationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Horse Management

    /// <summary>
    /// Approves a horse submission, confirming it meets system requirements and can participate in races.
    /// </summary>
    /// <param name="horseId">The ID of the horse to approve.</param>
    /// <returns>Confirmation of horse approval.</returns>
    [HttpPost("horses/{horseId:guid}/approve")]
    public async Task<ActionResult> ApproveHorse(Guid horseId)
    {
        var result = await _adminService.ApproveHorseAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Rejects a horse submission with an explanation reason.
    /// </summary>
    /// <param name="horseId">The ID of the horse to reject.</param>
    /// <param name="request">The rejection request containing the reason for rejection.</param>
    /// <returns>Confirmation of horse rejection.</returns>
    [HttpPost("horses/{horseId:guid}/reject")]
    public async Task<ActionResult> RejectHorse(Guid horseId, [FromBody] dynamic request)
    {
        // Extract rejection reason from request; use default message if not provided
        var reason = request?.reason?.ToString() ?? "No reason provided";
        var result = await _adminService.RejectHorseAsync(horseId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Jockey Management

    /// <summary>
    /// Approves a jockey submission, confirming they meet qualifications and can participate in races.
    /// </summary>
    /// <param name="jockeyId">The ID of the jockey to approve.</param>
    /// <returns>Confirmation of jockey approval.</returns>
    [HttpPost("jockeys/{jockeyId:guid}/approve")]
    public async Task<ActionResult> ApproveJockey(Guid jockeyId)
    {
        var result = await _adminService.ApproveJockeyAsync(jockeyId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Rejects a jockey submission with an explanation reason.
    /// </summary>
    /// <param name="jockeyId">The ID of the jockey to reject.</param>
    /// <param name="request">The rejection request containing the reason for rejection.</param>
    /// <returns>Confirmation of jockey rejection.</returns>
    [HttpPost("jockeys/{jockeyId:guid}/reject")]
    public async Task<ActionResult> RejectJockey(Guid jockeyId, [FromBody] dynamic request)
    {
        // Extract rejection reason from request; use default message if not provided
        var reason = request?.reason?.ToString() ?? "No reason provided";
        var result = await _adminService.RejectJockeyAsync(jockeyId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Operations

    /// <summary>
    /// Assigns a referee to a specific race for officiating and result verification.
    /// </summary>
    /// <param name="request">The assignment request containing referee and race IDs.</param>
    /// <returns>Confirmation of referee assignment to the race.</returns>
    [HttpPost("referees/assign")]
    public async Task<ActionResult> AssignReferee([FromBody] AssignRefereeRequest request)
    {
        var result = await _adminService.AssignRefereeToRaceAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Publishes the official result of a completed race to the system.
    /// </summary>
    /// <param name="raceId">The ID of the race to publish results for.</param>
    /// <param name="request">The race result request containing finishing positions and times.</param>
    /// <returns>Confirmation of race result publication.</returns>
    [HttpPost("races/{raceId:guid}/publish-result")]
    public async Task<ActionResult> PublishRaceResult(Guid raceId, [FromBody] RaceResultRequest request)
    {
        var result = await _adminService.PublishRaceResultAsync(raceId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion
}
