using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

/// <summary>
/// Service xử lý các chức năng liên quan đến Horse.
/// Bao gồm:
/// - Quản lý ngựa của chủ sở hữu
/// - Mời Jockey
/// - Đăng ký ngựa tham gia cuộc đua
/// - Xác nhận đăng ký của chủ ngựa
/// </summary>
public class HorseService : IHorseService
{
    // Repository thao tác với bảng Horse
    private readonly IHorseRepository _horses;

    // Repository thao tác với bảng Jockey
    private readonly IJockeyRepository _jockeys;

    // Repository thao tác với bảng Race
    private readonly IRaceRepository _races;

    // Repository thao tác với bảng RaceEntry
    private readonly IRaceEntryRepository _raceEntries;

    // Repository thao tác với bảng JockeyInvitation
    private readonly IJockeyInvitationRepository _invitations;

    // UnitOfWork dùng để lưu thay đổi xuống Database
    private readonly IUnitOfWork _unitOfWork;

    /// <summary>
    /// Constructor sử dụng Dependency Injection.
    /// </summary>
    public HorseService(
        IHorseRepository horses,
        IJockeyRepository jockeys,
        IRaceRepository races,
        IRaceEntryRepository raceEntries,
        IJockeyInvitationRepository invitations,
        IUnitOfWork unitOfWork)
    {
        _horses = horses;
        _jockeys = jockeys;
        _races = races;
        _raceEntries = raceEntries;
        _invitations = invitations;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Lấy danh sách tất cả ngựa thuộc về chủ ngựa.
    /// </summary>
    public async Task<ServiceResult<object>> GetMyHorsesAsync(Guid ownerId)
    {
        // Lấy danh sách Horse theo OwnerId
        var horses = await _horses.GetByOwnerAsync(ownerId);

        // Trả kết quả thành công
        return ServiceResult<object>.Ok(horses);
    }

    /// <summary>
    /// Tạo mới một Horse.
    /// Mặc định trạng thái ApprovalStatus là Pending.
    /// </summary>
    public async Task<ServiceResult<object>> CreateHorseAsync(Guid ownerId, HorseCreateRequest request)
    {
        // Khởi tạo Horse mới
        var horse = new Horse
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Age = request.Age,
            OwnerId = ownerId,

            // Chờ Admin phê duyệt
            ApprovalStatus = ApprovalStatus.Pending
        };

        // Thêm Horse vào Database
        await _horses.AddAsync(horse);

        // Lưu thay đổi
        await _unitOfWork.SaveChangesAsync();

        // Trả Horse vừa tạo
        return ServiceResult<object>.Ok(horse);
    }

    /// <summary>
    /// Cập nhật thông tin Horse.
    /// Chỉ chủ sở hữu mới được phép chỉnh sửa.
    /// </summary>
    public async Task<ServiceResult<object>> UpdateHorseAsync(Guid ownerId, Guid horseId, HorseUpdateRequest request)
    {
        // Kiểm tra Horse có thuộc Owner hay không
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);

        if (horse == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Horse not found.");
        }

        // Cập nhật thông tin Horse
        horse.Name = request.Name;
        horse.Age = request.Age;

        // Lưu thay đổi
        await _unitOfWork.SaveChangesAsync();

        // Trả Horse sau khi cập nhật
        return ServiceResult<object>.Ok(horse);
    }

    /// <summary>
    /// Xóa Horse khỏi hệ thống.
    /// Chỉ Owner mới có quyền xóa.
    /// </summary>
    public async Task<ServiceResult<string>> DeleteHorseAsync(Guid ownerId, Guid horseId)
    {
        // Kiểm tra Horse có thuộc Owner hay không
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);

        if (horse == null)
        {
            return ServiceResult<string>.Fail(
                StatusCodes.Status404NotFound,
                "Horse not found.");
        }

        // Xóa Horse
        await _horses.RemoveAsync(horse);

        // Lưu thay đổi
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<string>.Ok("Deleted");
    }

    /// <summary>
    /// Gửi lời mời Jockey tham gia điều khiển Horse trong Race.
    /// </summary>
    public async Task<ServiceResult<object>> InviteJockeyAsync(Guid ownerId, Guid horseId, JockeyInvitationCreateRequest request)
    {
        // Kiểm tra Horse có thuộc Owner không
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);

        if (horse == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Horse not found.");
        }

        // Kiểm tra Jockey có tồn tại không
        var jockeyExists = await _jockeys.ExistsAsync(request.JockeyId);

        if (!jockeyExists)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Jockey not found.");
        }

        // Tạo lời mời
        var invitation = new JockeyInvitation
        {
            Id = Guid.NewGuid(),
            HorseId = horseId,
            JockeyId = request.JockeyId,
            RaceId = request.RaceId,

            // Mặc định chờ Jockey phản hồi
            Status = JockeyInvitationStatus.Pending,

            CreatedAt = DateTime.UtcNow
        };

        // Lưu lời mời
        await _invitations.AddAsync(invitation);

        // Lưu Database
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(invitation);
    }

    /// <summary>
    /// Đăng ký Horse tham gia một Race.
    /// </summary>
    public async Task<ServiceResult<object>> RegisterHorseAsync(Guid ownerId, Guid horseId, Guid raceId, RaceRegistrationRequest request)
    {
        // Kiểm tra Horse có thuộc Owner không
        var horse = await _horses.GetOwnedHorseAsync(horseId, ownerId);

        if (horse == null)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Horse not found.");
        }

        // Kiểm tra Race có tồn tại không
        var raceExists = await _races.ExistsAsync(raceId);

        if (!raceExists)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Race not found.");
        }

        // Kiểm tra Horse đã đăng ký Race chưa
        var exists = await _raceEntries.ExistsAsync(raceId, horseId);

        if (exists)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status409Conflict,
                "Horse already registered.");
        }

        // Tạo RaceEntry mới
        var entry = new RaceEntry
        {
            Id = Guid.NewGuid(),
            RaceId = raceId,
            HorseId = horseId,

            // Chờ xác nhận
            Status = RegistrationStatus.Pending,

            // Xác nhận của Owner
            OwnerConfirmed = request.OwnerConfirmed,

            // Mặc định Jockey chưa xác nhận
            JockeyConfirmed = false
        };

        // Lưu RaceEntry
        await _raceEntries.AddAsync(entry);

        // Lưu Database
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(entry);
    }

    /// <summary>
    /// Chủ ngựa xác nhận việc tham gia cuộc đua.
    /// </summary>
    public async Task<ServiceResult<object>> ConfirmOwnerAsync(Guid ownerId, Guid raceId, Guid entryId)
    {
        // Lấy RaceEntry kèm thông tin Horse
        var entry = await _raceEntries.GetByIdWithHorseAsync(entryId, raceId);

        // Kiểm tra Entry có tồn tại và thuộc Owner không
        if (entry?.Horse == null || entry.Horse.OwnerId != ownerId)
        {
            return ServiceResult<object>.Fail(
                StatusCodes.Status404NotFound,
                "Entry not found.");
        }

        // Chủ ngựa xác nhận tham gia
        entry.OwnerConfirmed = true;

        // Lưu Database
        await _unitOfWork.SaveChangesAsync();

        // Trả kết quả
        return ServiceResult<object>.Ok(entry);
    }
}