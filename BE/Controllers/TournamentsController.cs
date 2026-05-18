using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API Controller for managing tournaments and rounds in the horse racing system.
/// Provides endpoints for creating, retrieving, updating, and deleting tournaments,
/// as well as managing tournament rounds.
/// </summary>
[ApiController]
[Route("api/tournaments")]
public class TournamentsController : ControllerBase
{
    /// <summary>
    /// Service for handling tournament-related business logic (CRUD operations, queries).
    /// </summary>
    private readonly ITournamentService _tournamentService;

    /// <summary>
    /// Service for handling round-related business logic within tournaments.
    /// </summary>
    private readonly IRoundService _roundService;

    /// <summary>
    /// Initializes a new instance of the TournamentsController class.
    /// </summary>
    /// <param name="tournamentService">The tournament service for business logic operations.</param>
    /// <param name="roundService">The round service for round management operations.</param>
    public TournamentsController(ITournamentService tournamentService, IRoundService roundService)
    {
        _tournamentService = tournamentService;
        _roundService = roundService;
    }

    #region Tournament CRUD Operations

    /// <summary>
    /// Creates a new tournament. Restricted to Admin role only.
    /// </summary>
    /// <param name="request">The tournament creation request data.</param>
    /// <returns>The created tournament with its details.</returns>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateTournament([FromBody] CreateTournamentRequest request)
    {
        var result = await _tournamentService.CreateTournamentAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all tournaments in the system. Publicly accessible (no authentication required).
    /// </summary>
    /// <returns>A list of all tournaments.</returns>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetAllTournaments()
    {
        var result = await _tournamentService.GetAllTournamentsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves only currently active tournaments. Publicly accessible.
    /// </summary>
    /// <returns>A list of active tournaments.</returns>
    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult> GetActiveTournaments()
    {
        var result = await _tournamentService.GetActiveTournamentsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific tournament by its ID. Publicly accessible.
    /// </summary>
    /// <param name="id">The ID of the tournament to retrieve.</param>
    /// <returns>The tournament details.</returns>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetTournament(Guid id)
    {
        var result = await _tournamentService.GetTournamentAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Updates an existing tournament. Restricted to Admin role only.
    /// </summary>
    /// <param name="id">The ID of the tournament to update.</param>
    /// <param name="request">The updated tournament data.</param>
    /// <returns>The updated tournament details.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateTournament(Guid id, [FromBody] UpdateTournamentRequest request)
    {
        var result = await _tournamentService.UpdateTournamentAsync(id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Deletes a tournament from the system. Restricted to Admin role only.
    /// </summary>
    /// <param name="id">The ID of the tournament to delete.</param>
    /// <returns>Confirmation of deletion.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteTournament(Guid id)
    {
        var result = await _tournamentService.DeleteTournamentAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Round Management

    /// <summary>
    /// Creates a new round for a specific tournament. Restricted to Admin role only.
    /// </summary>
    /// <param name="tournamentId">The ID of the tournament to add a round to.</param>
    /// <param name="request">The round creation request data.</param>
    /// <returns>The created round with its details.</returns>
    [HttpPost("{tournamentId:guid}/rounds")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateRound(Guid tournamentId, [FromBody] CreateRoundRequest request)
    {
        // Ensure the request contains the correct tournament ID
        if (request.TournamentId != tournamentId)
            request.TournamentId = tournamentId;

        var result = await _roundService.CreateRoundAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves all rounds for a specific tournament. Publicly accessible.
    /// </summary>
    /// <param name="tournamentId">The ID of the tournament.</param>
    /// <returns>A list of rounds for the specified tournament.</returns>
    [HttpGet("{tournamentId:guid}/rounds")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRoundsByTournament(Guid tournamentId)
    {
        var result = await _roundService.GetRoundsByTournamentAsync(tournamentId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Retrieves a specific round by its ID. Publicly accessible.
    /// </summary>
    /// <param name="roundId">The ID of the round to retrieve.</param>
    /// <returns>The round details.</returns>
    [HttpGet("rounds/{roundId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRound(Guid roundId)
    {
        var result = await _roundService.GetRoundAsync(roundId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Updates an existing round. Restricted to Admin role only.
    /// </summary>
    /// <param name="roundId">The ID of the round to update.</param>
    /// <param name="request">The updated round data.</param>
    /// <returns>The updated round details.</returns>
    [HttpPut("rounds/{roundId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateRound(Guid roundId, [FromBody] UpdateRoundRequest request)
    {
        var result = await _roundService.UpdateRoundAsync(roundId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Deletes a round from the system. Restricted to Admin role only.
    /// </summary>
    /// <param name="roundId">The ID of the round to delete.</param>
    /// <returns>Confirmation of deletion.</returns>
    [HttpDelete("rounds/{roundId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRound(Guid roundId)
    {
        var result = await _roundService.DeleteRoundAsync(roundId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion
}
