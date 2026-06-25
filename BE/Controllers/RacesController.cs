using System;
using System.Threading.Tasks;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API quản lý thông tin các cuộc đua (Race)
/// Cho phép mọi người xem danh sách race, chi tiết race và kết quả race
/// </summary>
[ApiController]
[Route("api/races")]
public class RacesController : ControllerBase
{
    // Service xử lý nghiệp vụ liên quan đến Race
    private readonly IRaceService _raceService;

    /// <summary>
    /// Constructor inject RaceService
    /// </summary>
    public RacesController(IRaceService raceService)
    {
        _raceService = raceService;
    }

    /// <summary>
    /// Lấy danh sách tất cả các cuộc đua
    /// GET: api/races
    /// Không yêu cầu đăng nhập
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaces()
    {
        // Gọi service lấy danh sách race
        var result = await _raceService.GetRacesAsync();

        // Trả về dữ liệu và status code
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một cuộc đua
    /// GET: api/races/{id}
    /// Không yêu cầu đăng nhập
    /// </summary>
    /// <param name="id">RaceId của cuộc đua</param>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRace(Guid id)
    {
        // Lấy thông tin race theo Id
        var result = await _raceService.GetRaceAsync(id);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy kết quả của một cuộc đua
    /// GET: api/races/{id}/result
    /// Không yêu cầu đăng nhập
    /// </summary>
    /// <param name="id">RaceId của cuộc đua</param>
    [HttpGet("{id:guid}/result")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaceResult(Guid id)
    {
        // Lấy bảng kết quả của race
        // Ví dụ:
        // Hạng 1: Horse A - Jockey X
        // Hạng 2: Horse B - Jockey Y
        // Hạng 3: Horse C - Jockey Z
        var result = await _raceService.GetRaceResultAsync(id);

        return StatusCode(result.StatusCode, result.Result);
    }
}