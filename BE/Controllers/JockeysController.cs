using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API dành cho Jockey (nài ngựa)
/// Chỉ user có role "Jockey" mới được truy cập
/// </summary>
[ApiController]
[Route("api/jockeys")]
[Authorize(Roles = "Jockey")]
public class JockeysController : ControllerBase
{
    // Service xử lý nghiệp vụ liên quan đến Jockey
    private readonly IJockeyService _jockeyService;

    /// <summary>
    /// Constructor inject JockeyService
    /// </summary>
    public JockeysController(IJockeyService jockeyService)
    {
        _jockeyService = jockeyService;
    }

    /// <summary>
    /// Lấy danh sách lời mời điều khiển ngựa
    /// GET: api/jockeys/invitations
    /// </summary>
    [HttpGet("invitations")]
    public async Task<ActionResult> GetInvitations()
    {
        // Lấy UserId từ JWT Token
        var userId = GetUserId();

        // Lấy danh sách lời mời đang chờ phản hồi
        var result = await _jockeyService.GetInvitationsAsync(userId);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Phản hồi lời mời điều khiển ngựa
    /// POST: api/jockeys/invitations/{id}/respond
    /// </summary>
    /// <param name="id">Id của lời mời</param>
    /// <param name="request">
    /// Thông tin phản hồi:
    /// - Accept: Đồng ý
    /// - Reject: Từ chối
    /// </param>
    [HttpPost("invitations/{id:guid}/respond")]
    public async Task<ActionResult> RespondInvitation(
        Guid id,
        JockeyInvitationRespondRequest request)
    {
        var userId = GetUserId();

        // Xử lý đồng ý hoặc từ chối lời mời
        var result = await _jockeyService.RespondInvitationAsync(
            userId,
            id,
            request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy danh sách các giải đua được phân công
    /// GET: api/jockeys/races
    /// </summary>
    [HttpGet("races")]
    public async Task<ActionResult> GetAssignedRaces()
    {
        var userId = GetUserId();

        // Lấy danh sách race mà jockey đã được gán
        var result = await _jockeyService.GetAssignedRacesAsync(userId);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy UserId từ JWT Token
    /// ClaimTypes.NameIdentifier chứa UserId
    /// </summary>
    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Nếu token không chứa UserId thì trả Guid.Empty
        return userIdValue == null
            ? Guid.Empty
            : Guid.Parse(userIdValue);
    }
}