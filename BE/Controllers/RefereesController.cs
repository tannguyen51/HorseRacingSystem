using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/referees")]
public class RefereesController : ControllerBase
{
    private readonly IRefereeService _refereeService;
    private readonly IRefereeHtmlCheckService _healthCheckService;
    private readonly IViolationRecordService _violationService;
    private readonly IRaceReportService _reportService;
    private readonly IRefereeRepository _refereeRepo;
    private readonly IRefereeAssignmentRepository _assignmentRepo;
    private readonly IRaceEntryRepository _entryRepo;

    public RefereesController(
        IRefereeService refereeService,
        IRefereeHtmlCheckService healthCheckService,
        IViolationRecordService violationService,
        IRaceReportService reportService,
        IRefereeRepository refereeRepo,
        IRefereeAssignmentRepository assignmentRepo,
        IRaceEntryRepository entryRepo)
    {
        _refereeService = refereeService;
        _healthCheckService = healthCheckService;
        _violationService = violationService;
        _reportService = reportService;
        _refereeRepo = refereeRepo;
        _assignmentRepo = assignmentRepo;
        _entryRepo = entryRepo;
    }

    // Referee Management
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateReferee([FromBody] CreateRefereeRequest request)
    {
        var result = await _refereeService.CreateRefereeAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetAllReferees()
    {
        var result = await _refereeService.GetAllRefereesAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult> GetActiveReferees()
    {
        var result = await _refereeService.GetActiveRefereesAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetReferee(Guid id)
    {
        var result = await _refereeService.GetRefereeAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> UpdateReferee(Guid id, [FromBody] UpdateRefereeRequest request)
    {
        var result = await _refereeService.UpdateRefereeAsync(id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteReferee(Guid id)
    {
        var result = await _refereeService.DeleteRefereeAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Referee Assignment
    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AssignRefereeToRace([FromBody] AssignRefereeRequest request)
    {
        var result = await _refereeService.AssignRefereeToRaceAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("race/{raceId:guid}/assignments")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> GetRaceAssignments(Guid raceId)
    {
        var result = await _refereeService.GetRaceAssignmentsAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{refereeId:guid}/assignments")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> GetRefereeAssignments(Guid refereeId)
    {
        var result = await _refereeService.GetRefereeAssignmentsAsync(refereeId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("assignments/{assignmentId:guid}/confirm")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> ConfirmAssignment(Guid assignmentId, [FromBody] ConfirmRefereeAssignmentRequest request)
    {
        request.AssignmentId = assignmentId;
        var result = await _refereeService.ConfirmAssignmentAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("my-assignments")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> GetMyAssignments([FromQuery] string? status)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var referee = await _refereeRepo.GetByUserIdAsync(userId);
        if (referee is null)
            return NotFound(new { message = "Referee profile not found." });

        var result = await _refereeService.GetRefereeAssignmentsAsync(referee.Id);
        if (result.StatusCode != 200)
            return StatusCode(result.StatusCode, result.Result);

        if (!string.IsNullOrEmpty(status)
            && result.Result.Data is System.Collections.Generic.IEnumerable<RefereeAssignmentResponse> all)
        {
            var filtered = all
                .Where(a => string.Equals(a.Status, status, StringComparison.OrdinalIgnoreCase))
                .ToList();
            return Ok(ApiResult<IEnumerable<RefereeAssignmentResponse>>.Ok(filtered));
        }

        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("assignments/{assignmentId:guid}/respond")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> RespondToAssignment(Guid assignmentId, [FromBody] RespondToAssignmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Response)
            || request.Response is not ("Accept" or "Reject"))
            return BadRequest(new { message = "Response must be 'Accept' or 'Reject'." });

        var assignment = await _assignmentRepo.GetByIdAsync(assignmentId);
        if (assignment is null)
            return NotFound(new { message = "Assignment not found." });

        if (string.Equals(request.Response, "Accept", StringComparison.OrdinalIgnoreCase))
        {
            assignment.Status = RefereeAssignmentStatus.Confirmed;
            assignment.ConfirmedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Notes))
                assignment.Notes = request.Notes;
        }
        else
        {
            assignment.Status = RefereeAssignmentStatus.Cancelled;
            assignment.CompletedAt = DateTime.UtcNow;
            assignment.Notes = request.Notes ?? "Rejected by referee";
        }

        await _assignmentRepo.UpdateAsync(assignment);
        return Ok(new { message = $"Assignment {request.Response.ToLowerInvariant()}ed." });
    }

    [HttpGet("race/{raceId:guid}/entries")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRaceEntries(Guid raceId)
    {
        var entries = await _entryRepo.GetByRaceAsync(raceId);
        var result = entries.Select(e => new
        {
            EntryId = e.Id,
            HorseId = e.HorseId,
            HorseName = e.Horse?.Name ?? e.HorseId.ToString(),
            JockeyId = e.JockeyId,
            JockeyName = e.Jockey?.User?.FullName,
            Status = e.Status.ToString()
        });
        return Ok(result);
    }

    // Health Checks
    [HttpPost("health-checks")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CreateHealthCheck([FromBody] CreateHealthCheckRequest request)
    {
        var result = await _healthCheckService.CreateHealthCheckAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("health-checks/{healthCheckId:guid}/complete")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CompleteHealthCheck(Guid healthCheckId, [FromBody] CompleteHealthCheckRequest request)
    {
        request.HealthCheckId = healthCheckId;
        var result = await _healthCheckService.CompleteHealthCheckAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("health-checks/{healthCheckId:guid}")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetHealthCheck(Guid healthCheckId)
    {
        var result = await _healthCheckService.GetHealthCheckAsync(healthCheckId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("race/{raceId:guid}/health-checks")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRaceHealthChecks(Guid raceId)
    {
        var result = await _healthCheckService.GetRaceHealthChecksAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("horse/{horseId:guid}/health-history")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHorseHealthHistory(Guid horseId)
    {
        var result = await _healthCheckService.GetHorseHealthCheckHistoryAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("health-checks/{healthCheckId:guid}/approve")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> ApproveHorse(Guid healthCheckId)
    {
        var result = await _healthCheckService.ApproveHorseForRaceAsync(healthCheckId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("health-checks/{healthCheckId:guid}/reject")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> RejectHorse(Guid healthCheckId, [FromBody] dynamic request)
    {
        string reason = request?.reason?.ToString() ?? "Health check failed";
        var result = await _healthCheckService.RejectHorseForRaceAsync(healthCheckId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Violations
    [HttpPost("violations")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> RecordViolation([FromBody] CreateViolationRequest request)
    {
        var result = await _violationService.RecordViolationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("violations/{id:guid}")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetViolation(Guid id)
    {
        var result = await _violationService.GetViolationAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("race/{raceId:guid}/violations")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRaceViolations(Guid raceId)
    {
        var result = await _violationService.GetRaceViolationsAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("horse/{horseId:guid}/violations")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHorseViolations(Guid horseId)
    {
        var result = await _violationService.GetHorseViolationsAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Reports
    [HttpPost("reports")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CreateReport([FromBody] CreateRaceReportRequest request)
    {
        var result = await _reportService.CreateReportAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("reports/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetReport(Guid id)
    {
        var result = await _reportService.GetReportAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("race/{raceId:guid}/report")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaceReport(Guid raceId)
    {
        var result = await _reportService.GetRaceReportAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{refereeId:guid}/reports")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRefereeReports(Guid refereeId)
    {
        var result = await _reportService.GetRefereeReportsAsync(refereeId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPut("reports/{id:guid}")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> UpdateReport(Guid id, [FromBody] CreateRaceReportRequest request)
    {
        var result = await _reportService.UpdateReportAsync(id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("reports/{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> PublishReport(Guid id)
    {
        var result = await _reportService.PublishReportAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }
}
