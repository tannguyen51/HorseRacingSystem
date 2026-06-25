using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API quản lý Race dành cho Admin và Referee
/// - Admin: toàn quyền CRUD Race, phân ngựa, hủy Race
/// - Referee: điều khiển Race (Start/End)
/// </summary>
[ApiController]
[Route("api/races/management")]
[Authorize(Roles = "Admin,Referee")]
public class RacesManagementController : ControllerBase
{
    // Service xử lý nghiệp vụ quản lý Race
    private readonly IRaceManagementService _raceService;

    /// <summary>
    /// Constructor inject RaceManagementService
    /// </summary>
    public RacesManagementController(IRaceManagementService raceService)
    {
        _raceService = raceService;
    }

    #region Race CRUD

    /// <summary>
    /// Tạo Race mới
    /// POST: api/races/management
    /// Chỉ Admin được phép
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CreateRace(
        [FromBody] CreateRaceRequest request)
    {
        var result = await _raceService.CreateRaceAsync(request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Xem chi tiết Race
    /// GET: api/races/management/{raceId}
    /// Cho phép tất cả người dùng xem
    /// </summary>
    [HttpGet("{raceId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaceDetails(Guid raceId)
    {
        var result = await _raceService.GetRaceDetailsAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Cập nhật thông tin Race
    /// PUT: api/races/management/{raceId}
    /// Chỉ Admin được phép
    /// </summary>
    [HttpPut("{raceId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> UpdateRace(
        Guid raceId,
        [FromBody] UpdateRaceRequest request)
    {
        var result = await _raceService.UpdateRaceAsync(raceId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Xóa Race
    /// DELETE: api/races/management/{raceId}
    /// Chỉ Admin được phép
    /// </summary>
    [HttpDelete("{raceId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRace(Guid raceId)
    {
        var result = await _raceService.DeleteRaceAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Query Race

    /// <summary>
    /// Lấy danh sách Race thuộc Tournament
    /// GET: api/races/management/tournament/{tournamentId}
    /// </summary>
    [HttpGet("tournament/{tournamentId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRacesByTournament(Guid tournamentId)
    {
        var result = await _raceService.GetRacesByTournamentAsync(tournamentId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy danh sách Race thuộc một vòng đấu
    /// GET: api/races/management/round/{roundId}
    /// </summary>
    [HttpGet("round/{roundId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRacesByRound(Guid roundId)
    {
        var result = await _raceService.GetRacesByRoundAsync(roundId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Horse Assignment

    /// <summary>
    /// Thêm một ngựa vào Race
    /// POST: api/races/management/{raceId}/assign-horse
    /// Chỉ Admin được phép
    /// </summary>
    [HttpPost("{raceId:guid}/assign-horse")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AssignHorseToRace(
        Guid raceId,
        [FromBody] AssignHorseToRaceRequest request)
    {
        var result = await _raceService.AssignHorseToRaceAsync(
            raceId,
            request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Thêm nhiều ngựa vào Race cùng lúc
    /// POST: api/races/management/{raceId}/bulk-assign-horses
    /// </summary>
    [HttpPost("{raceId:guid}/bulk-assign-horses")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> BulkAssignHorsesToRace(
        Guid raceId,
        [FromBody] BulkAssignHorsesToRaceRequest request)
    {
        var result = await _raceService.BulkAssignHorsesToRaceAsync(
            raceId,
            request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Loại bỏ một ngựa khỏi Race
    /// DELETE: api/races/management/{raceId}/remove-horse/{horseId}
    /// </summary>
    [HttpDelete("{raceId:guid}/remove-horse/{horseId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> RemoveHorseFromRace(
        Guid raceId,
        Guid horseId)
    {
        var result = await _raceService.RemoveHorseFromRaceAsync(
            raceId,
            horseId);

        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion

    #region Race Control

    /// <summary>
    /// Bắt đầu cuộc đua
    /// POST: api/races/management/{raceId}/start
    /// Admin hoặc Referee được phép
    /// </summary>
    [HttpPost("{raceId:guid}/start")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> StartRace(Guid raceId)
    {
        var result = await _raceService.StartRaceAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Kết thúc cuộc đua
    /// POST: api/races/management/{raceId}/end
    /// Admin hoặc Referee được phép
    /// </summary>
    [HttpPost("{raceId:guid}/end")]
    [Authorize(Roles = "Admin,Referee")]
    public async Task<ActionResult> EndRace(Guid raceId)
    {
        var result = await _raceService.EndRaceAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Hủy cuộc đua
    /// POST: api/races/management/{raceId}/cancel
    /// Chỉ Admin được phép
    /// </summary>
    [HttpPost("{raceId:guid}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> CancelRace(Guid raceId)
    {
        var result = await _raceService.CancelRaceAsync(raceId);
        return StatusCode(result.StatusCode, result.Result);
    }

    #endregion
}