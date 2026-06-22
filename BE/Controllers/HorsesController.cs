using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API quản lý ngựa dành cho Horse Owner
/// Chỉ những user có role "HorseOwner" mới được phép truy cập
/// </summary>
[ApiController]
[Route("api/horses")]
[Authorize(Roles = "HorseOwner")]
public class HorsesController : ControllerBase
{
    // Service xử lý nghiệp vụ liên quan đến ngựa
    private readonly IHorseService _horseService;

    /// <summary>
    /// Constructor inject HorseService
    /// </summary>
    public HorsesController(IHorseService horseService)
    {
        _horseService = horseService;
    }

    /// <summary>
    /// Lấy danh sách ngựa của chủ sở hữu hiện tại
    /// GET: api/horses
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetMyHorses()
    {
        // Lấy UserId từ JWT Token
        var ownerId = GetUserId();

        // Gọi service lấy danh sách ngựa
        var result = await _horseService.GetMyHorsesAsync(ownerId);

        // Trả về status code và dữ liệu
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Tạo ngựa mới
    /// POST: api/horses
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateHorse(HorseCreateRequest request)
    {
        var ownerId = GetUserId();

        // Tạo ngựa thuộc owner hiện tại
        var result = await _horseService.CreateHorseAsync(ownerId, request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Cập nhật thông tin ngựa
    /// PUT: api/horses/{id}
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateHorse(Guid id, HorseUpdateRequest request)
    {
        var ownerId = GetUserId();

        // Chỉ owner của ngựa mới được sửa
        var result = await _horseService.UpdateHorseAsync(ownerId, id, request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Xóa ngựa
    /// DELETE: api/horses/{id}
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteHorse(Guid id)
    {
        var ownerId = GetUserId();

        // Chỉ owner sở hữu ngựa mới được xóa
        var result = await _horseService.DeleteHorseAsync(ownerId, id);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Gửi lời mời Jockey điều khiển ngựa
    /// POST: api/horses/{horseId}/jockey-invitations
    /// </summary>
    [HttpPost("{horseId:guid}/jockey-invitations")]
    public async Task<ActionResult> InviteJockey(
        Guid horseId,
        JockeyInvitationCreateRequest request)
    {
        var ownerId = GetUserId();

        // Tạo lời mời jockey cho ngựa
        var result = await _horseService.InviteJockeyAsync(
            ownerId,
            horseId,
            request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Đăng ký ngựa tham gia một giải đua
    /// POST: api/horses/{horseId}/races/{raceId}/registrations
    /// </summary>
    [HttpPost("{horseId:guid}/races/{raceId:guid}/registrations")]
    public async Task<ActionResult> RegisterHorse(
        Guid horseId,
        Guid raceId,
        RaceRegistrationRequest request)
    {
        var ownerId = GetUserId();

        // Đăng ký ngựa vào giải đua
        var result = await _horseService.RegisterHorseAsync(
            ownerId,
            horseId,
            raceId,
            request);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Chủ ngựa xác nhận tham gia giải đua
    /// POST: api/horses/races/{raceId}/entries/{entryId}/owner-confirm
    /// </summary>
    [HttpPost("races/{raceId:guid}/entries/{entryId:guid}/owner-confirm")]
    public async Task<ActionResult> ConfirmOwner(
        Guid raceId,
        Guid entryId)
    {
        var ownerId = GetUserId();

        // Xác nhận đăng ký tham gia giải đua
        var result = await _horseService.ConfirmOwnerAsync(
            ownerId,
            raceId,
            entryId);

        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Lấy UserId từ JWT Token
    /// ClaimTypes.NameIdentifier thường chứa UserId
    /// </summary>
    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Nếu không có UserId thì trả Guid.Empty
        return value == null
            ? Guid.Empty
            : Guid.Parse(value);
    }
}