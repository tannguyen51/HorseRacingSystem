using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API Controller for managing referees and their operations in the horse racing system.
/// Provides endpoints for referee management, race assignments, health checks, violation recording,
/// and race report generation. Referees oversee races, conduct health checks, and document violations.
/// </summary>
[ApiController]
[Route("api/referees")]
public class RefereesController : ControllerBase
{
    /// <summary>
    /// Service for handling referee CRUD operations and assignments.
    /// </summary>
    private readonly IRefereeService _refereeService;

    /// <summary>
    /// Service for managing horse health checks before races.
    /// </summary>
    private readonly IRefereeHtmlCheckService _healthCheckService;

    /// <summary>
    /// Service for recording and managing rule violations during races.
    /// </summary>
    private readonly IViolationRecordService _violationService;

    /// <summary>
    /// Service for creating and managing race reports filed by referees.
    /// </summary>
    private readonly IRaceReportService _reportService;

    /// <summary>
    /// Initializes a new instance of the RefereesController class.
    /// </summary>
    /// <param name="refereeService">Service for referee operations.</param>
    /// <param name="healthCheckService">Service for health check management.</param>
    /// <param name="violationService">Service for violation recording.</param>
    /// <param name="reportService">Service for race report management.</param>
    public RefereesController(
        IRefereeService refereeService,
        IRefereeHtmlCheckService healthCheckService,
        IViolationRecordService violationService,
        IRaceReportService reportService)
    {
        _refereeService = refereeService;
        _healthCheckService = healthCheckService;
        _violationService = violationService;
        _reportService = reportService;
    }

    #region Referee Management

    /// <summary>
    /// Creates a new referee in the system. Restricted to Admin role only.
    /// </summary>
    /// <param name="request">The referee creation request with personal and qualification details.</param>
    /// <returns>The created referee with assigned ID.</returns>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateReferee([FromBody] CreateRefereeRequest request)
    {
        var result = await _refereeService.CreateRefereeAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all referees in the system. Publicly accessible.
    /// </summary>
    /// <returns>A list of all referees with their details.</returns>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetAllReferees()
    {
        var result = await _refereeService.GetAllRefereesAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves only active referees currently available for race assignments. Publicly accessible.
    /// </summary>
    /// <returns>A list of active referees.</returns>
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult> GetActiveReferees()
    {
        var result = await _refereeService.GetActiveRefereesAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific referee by their ID. Publicly accessible.
    /// </summary>
    /// <param name="id">The ID of the referee to retrieve.</param>
    /// <returns>The referee's detailed information.</returns>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetReferee(Guid id)
    {
        var result = await _refereeService.GetRefereeAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Updates a referee's information. Accessible by Admin or the referee themselves.
    /// </summary>
    /// <param name="id">The ID of the referee to update.</param>
    /// <param name="request">The updated referee information.</param>
    /// <returns>The updated referee details.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> UpdateReferee(Guid id, [FromBody] UpdateRefereeRequest request)
    {
        var result = await _refereeService.UpdateRefereeAsync(id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Deletes a referee from the system. Restricted to Admin role only.
    /// </summary>
    /// <param name="id">The ID of the referee to delete.</param>
    /// <returns>Confirmation of deletion.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteReferee(Guid id)
    {
        var result = await _refereeService.DeleteRefereeAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Referee Assignment

    /// <summary>
    /// Assigns a referee to a specific race for officiating. Restricted to Admin role only.
    /// </summary>
    /// <param name="request">The assignment request containing referee and race IDs.</param>
    /// <returns>Confirmation of referee assignment.</returns>
    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AssignRefereeToRace([FromBody] AssignRefereeRequest request)
    {
        var result = await _refereeService.AssignRefereeToRaceAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all referee assignments for a specific race. Accessible by Admin and Referees.
    /// </summary>
    /// <param name="raceId">The ID of the race to get assignments for.</param>
    /// <returns>A list of referees assigned to the race.</returns>
    [HttpGet("race/{raceId:guid}/assignments")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> GetRaceAssignments(Guid raceId)
    {
        var result = await _refereeService.GetRaceAssignmentsAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all race assignments for a specific referee. Restricted to Referees.
    /// </summary>
    /// <param name="refereeId">The ID of the referee.</param>
    /// <returns>A list of races assigned to the referee.</returns>
    [HttpGet("{refereeId:guid}/assignments")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> GetRefereeAssignments(Guid refereeId)
    {
        var result = await _refereeService.GetRefereeAssignmentsAsync(refereeId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Confirms a referee's acceptance of a race assignment. Restricted to Referees.
    /// </summary>
    /// <param name="assignmentId">The ID of the assignment to confirm.</param>
    /// <param name="request">The confirmation request with assignment ID and status.</param>
    /// <returns>Confirmation of assignment acceptance.</returns>
    [HttpPost("assignments/{assignmentId:guid}/confirm")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> ConfirmAssignment(Guid assignmentId, [FromBody] ConfirmRefereeAssignmentRequest request)
    {
        // Ensure the request contains the correct assignment ID
        request.AssignmentId = assignmentId;
        var result = await _refereeService.ConfirmAssignmentAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Health Checks

    /// <summary>
    /// Creates a new health check for a horse before a race. Restricted to Referees.
    /// </summary>
    /// <param name="request">The health check creation request with horse and race details.</param>
    /// <returns>The created health check record.</returns>
    [HttpPost("health-checks")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CreateHealthCheck([FromBody] CreateHealthCheckRequest request)
    {
        var result = await _healthCheckService.CreateHealthCheckAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Completes a health check with detailed findings and results. Restricted to Referees.
    /// </summary>
    /// <param name="healthCheckId">The ID of the health check to complete.</param>
    /// <param name="request">The completion request with health check findings.</param>
    /// <returns>The completed health check details.</returns>
    [HttpPost("health-checks/{healthCheckId:guid}/complete")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CompleteHealthCheck(Guid healthCheckId, [FromBody] CompleteHealthCheckRequest request)
    {
        // Ensure the request contains the correct health check ID
        request.HealthCheckId = healthCheckId;
        var result = await _healthCheckService.CompleteHealthCheckAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific health check by its ID. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="healthCheckId">The ID of the health check to retrieve.</param>
    /// <returns>The health check details and findings.</returns>
    [HttpGet("health-checks/{healthCheckId:guid}")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetHealthCheck(Guid healthCheckId)
    {
        var result = await _healthCheckService.GetHealthCheckAsync(healthCheckId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all health checks for a specific race. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="raceId">The ID of the race.</param>
    /// <returns>A list of health checks conducted for the race.</returns>
    [HttpGet("race/{raceId:guid}/health-checks")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRaceHealthChecks(Guid raceId)
    {
        var result = await _healthCheckService.GetRaceHealthChecksAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves the health check history for a specific horse. Publicly accessible.
    /// </summary>
    /// <param name="horseId">The ID of the horse.</param>
    /// <returns>A list of all past health checks for the horse.</returns>
    [HttpGet("horse/{horseId:guid}/health-history")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHorseHealthHistory(Guid horseId)
    {
        var result = await _healthCheckService.GetHorseHealthCheckHistoryAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Approves a horse to participate in a race after passing health check. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="healthCheckId">The ID of the health check to approve.</param>
    /// <returns>Confirmation of horse approval for the race.</returns>
    [HttpPost("health-checks/{healthCheckId:guid}/approve")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> ApproveHorse(Guid healthCheckId)
    {
        var result = await _healthCheckService.ApproveHorseForRaceAsync(healthCheckId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Rejects a horse from participating in a race with a health-related reason. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="healthCheckId">The ID of the health check to reject.</param>
    /// <param name="request">The rejection request containing the reason for rejection.</param>
    /// <returns>Confirmation of horse rejection for the race.</returns>
    [HttpPost("health-checks/{healthCheckId:guid}/reject")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> RejectHorse(Guid healthCheckId, [FromBody] dynamic request)
    {
        // Extract rejection reason from request; use default message if not provided
        string reason = request?.reason?.ToString() ?? "Health check failed";
        var result = await _healthCheckService.RejectHorseForRaceAsync(healthCheckId, reason);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Violations

    /// <summary>
    /// Records a rule violation by a participant during a race. Restricted to Referees.
    /// </summary>
    /// <param name="request">The violation report with details about the infraction.</param>
    /// <returns>The recorded violation entry.</returns>
    [HttpPost("violations")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> RecordViolation([FromBody] CreateViolationRequest request)
    {
        var result = await _violationService.RecordViolationAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific violation record by its ID. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="id">The ID of the violation to retrieve.</param>
    /// <returns>The violation details.</returns>
    [HttpGet("violations/{id:guid}")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetViolation(Guid id)
    {
        var result = await _violationService.GetViolationAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all violations recorded during a specific race. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="raceId">The ID of the race.</param>
    /// <returns>A list of all violations from the race.</returns>
    [HttpGet("race/{raceId:guid}/violations")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRaceViolations(Guid raceId)
    {
        var result = await _violationService.GetRaceViolationsAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all violations associated with a specific horse throughout its racing history. Publicly accessible.
    /// </summary>
    /// <param name="horseId">The ID of the horse.</param>
    /// <returns>A list of all violations involving the horse.</returns>
    [HttpGet("horse/{horseId:guid}/violations")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHorseViolations(Guid horseId)
    {
        var result = await _violationService.GetHorseViolationsAsync(horseId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Reports

    /// <summary>
    /// Creates a comprehensive race report documenting race events and results. Restricted to Referees.
    /// </summary>
    /// <param name="request">The race report data including race details, results, and observations.</param>
    /// <returns>The created race report.</returns>
    [HttpPost("reports")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> CreateReport([FromBody] CreateRaceReportRequest request)
    {
        var result = await _reportService.CreateReportAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific race report by its ID. Publicly accessible.
    /// </summary>
    /// <param name="id">The ID of the report to retrieve.</param>
    /// <returns>The race report details.</returns>
    [HttpGet("reports/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetReport(Guid id)
    {
        var result = await _reportService.GetReportAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves the race report for a specific race. Publicly accessible.
    /// </summary>
    /// <param name="raceId">The ID of the race.</param>
    /// <returns>The race report.</returns>
    [HttpGet("race/{raceId:guid}/report")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaceReport(Guid raceId)
    {
        var result = await _reportService.GetRaceReportAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all race reports filed by a specific referee. Accessible by Referees and Admins.
    /// </summary>
    /// <param name="refereeId">The ID of the referee.</param>
    /// <returns>A list of reports filed by the referee.</returns>
    [HttpGet("{refereeId:guid}/reports")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetRefereeReports(Guid refereeId)
    {
        var result = await _reportService.GetRefereeReportsAsync(refereeId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Updates an existing race report with new information or corrections. Restricted to Referees.
    /// </summary>
    /// <param name="id">The ID of the report to update.</param>
    /// <param name="request">The updated report data.</param>
    /// <returns>The updated race report.</returns>
    [HttpPut("reports/{id:guid}")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> UpdateReport(Guid id, [FromBody] CreateRaceReportRequest request)
    {
        var result = await _reportService.UpdateReportAsync(id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Publishes a race report to make it official and permanently recorded. Restricted to Admin role only.
    /// </summary>
    /// <param name="id">The ID of the report to publish.</param>
    /// <returns>Confirmation of report publication.</returns>
    [HttpPost("reports/{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> PublishReport(Guid id)
    {
        var result = await _reportService.PublishReportAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion
}
