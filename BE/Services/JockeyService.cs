using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

/// <summary>
/// Service xử lý các chức năng dành cho Jockey.
/// Bao gồm:
/// - Xem lời mời từ Horse Owner
/// - Chấp nhận hoặc từ chối lời mời
/// - Xem danh sách cuộc đua được phân công
/// </summary>
public class JockeyService : IJockeyService
{
    // Repository thao tác với bảng Jockey
    private readonly IJockeyRepository _jockeys;

    // Repository thao tác với bảng JockeyInvitation
    private readonly IJockeyInvitationRepository _invitations;

    // Repository thao tác với bảng RaceEntry
    private readonly IRaceEntryRepository _raceEntries;

    // UnitOfWork dùng để lưu thay đổi xuống Database
    private readonly IUnitOfWork _unitOfWork;

    /// <summary>
    /// Constructor sử dụng Dependency Injection.
    /// </summary>
    public JockeyService(
        IJockeyRepository jockeys,
        IJockeyInvitationRepository invitations,
        IRaceEntryRepository raceEntries,
        IUnitOfWork unitOfWork)
    {
        _jockeys = jockeys;
        _invitations = invitations;
        _raceEntries = raceEntries;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Lấy danh sách lời mời mà Jockey nhận được.
    /// </summary>
    public async Task<ServiceResult<object>> GetInvitationsAsync(Guid userId)
    {
        // Lấy thông tin Jockey theo UserId
        var jockey = await _jockeys.GetByUserIdAsync(userId);

        // Kiểm tra Jockey có tồn tại không
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Jockey profile not found.");
        }

        // Lấy danh sách lời mời của Jockey
        var invitations = await _invitations.GetByJockeyAsync(jockey.Id);

        // Trả kết quả
        return ServiceResult<object>.Ok(invitations);
    }

    /// <summary>
    /// Jockey phản hồi lời mời.
    /// Có thể chấp nhận hoặc từ chối.
    /// </summary>
    public async Task<ServiceResult<object>> RespondInvitationAsync(
        Guid userId,
        Guid invitationId,
        JockeyInvitationRespondRequest request)
    {
        // Lấy thông tin Jockey
        var jockey = await _jockeys.GetByUserIdAsync(userId);

        // Kiểm tra Jockey có tồn tại không
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Jockey profile not found.");
        }

        // Lấy lời mời theo Id
        var invitation = await _invitations.GetByIdAsync(invitationId, jockey.Id);

        // Kiểm tra lời mời có tồn tại không
        if (invitation == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Invitation not found.");
        }

        // Cập nhật trạng thái lời mời
        invitation.Status = request.Accept
            ? JockeyInvitationStatus.Accepted
            : JockeyInvitationStatus.Declined;

        // Nếu Jockey chấp nhận lời mời và lời mời có Race
        if (request.Accept && invitation.RaceId.HasValue)
        {
            // Tìm RaceEntry tương ứng
            var entry = await _raceEntries.GetByRaceHorseAsync(
                invitation.RaceId.Value,
                invitation.HorseId);

            // Kiểm tra RaceEntry có tồn tại không
            if (entry == null)
            {
                return ServiceResult<object>.Fail(
                    StatusCodes.Status404NotFound,
                    "Race entry not found for this horse.");
            }

            // Gán Jockey cho RaceEntry
            entry.JockeyId = jockey.Id;

            // Xác nhận Jockey tham gia cuộc đua
            entry.JockeyConfirmed = true;
        }

        // Lưu thay đổi xuống Database
        await _unitOfWork.SaveChangesAsync();

        // Trả kết quả
        return ServiceResult<object>.Ok(invitation);
    }

    /// <summary>
    /// Lấy danh sách các cuộc đua mà Jockey được phân công.
    /// </summary>
    public async Task<ServiceResult<object>> GetAssignedRacesAsync(Guid userId)
    {
        // Lấy thông tin Jockey theo UserId
        var jockey = await _jockeys.GetByUserIdAsync(userId);

        // Kiểm tra Jockey có tồn tại không
        if (jockey == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Jockey profile not found.");
        }

        // Lấy danh sách Race mà Jockey tham gia
        var races = await _raceEntries.GetByJockeyAsync(jockey.Id);

        // Trả kết quả
        return ServiceResult<object>.Ok(races);
    }
}