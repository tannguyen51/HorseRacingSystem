using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace HorseRacing.Services;

/// <summary>
/// Service xử lý các chức năng dành cho Admin như:
/// - Dashboard
/// - Quản lý User
/// - Duyệt đăng ký tài khoản
/// - Duyệt Horse/Jockey
/// - Phân công Referee
/// - Công bố kết quả cuộc đua
/// </summary>
public class AdminService : IAdminService
{
    // Dùng để mã hóa mật khẩu trước khi lưu vào database
    private readonly PasswordHasher<User> _passwordHasher = new();

    // Repository thao tác với bảng User
    private readonly IUserRepository _userRepo;

    // Repository thao tác với bảng UserRegistration
    private readonly IUserRegistrationRepository _registrationRepo;

    // Repository thao tác với bảng Horse
    private readonly IHorseRepository _horseRepo;

    // Repository thao tác với bảng Jockey
    private readonly IJockeyRepository _jockeyRepo;

    // Repository thao tác với bảng Referee
    private readonly IRefereeRepository _refereeRepo;

    // Repository thao tác với bảng Race
    private readonly IRaceRepository _raceRepo;

    // Repository thao tác với bảng Tournament
    private readonly ITournamentRepository _tournamentRepo;

    // Service xử lý phân công trọng tài
    private readonly IRefereeService _refereeService;

    // Service xử lý cập nhật kết quả cuộc đua
    private readonly ILiveResultService _liveResultService;

    // UnitOfWork dùng để lưu thay đổi xuống database
    private readonly IUnitOfWork _unitOfWork;

    /// <summary>
    /// Constructor sử dụng Dependency Injection để nhận các Repository và Service.
    /// </summary>
    public AdminService(
        IUserRepository userRepo,
        IUserRegistrationRepository registrationRepo,
        IHorseRepository horseRepo,
        IJockeyRepository jockeyRepo,
        IRefereeRepository refereeRepo,
        IRaceRepository raceRepo,
        ITournamentRepository tournamentRepo,
        IRefereeService refereeService,
        ILiveResultService liveResultService,
        IUnitOfWork unitOfWork)
    {
        _userRepo = userRepo;
        _registrationRepo = registrationRepo;
        _horseRepo = horseRepo;
        _jockeyRepo = jockeyRepo;
        _refereeRepo = refereeRepo;
        _raceRepo = raceRepo;
        _tournamentRepo = tournamentRepo;
        _refereeService = refereeService;
        _liveResultService = liveResultService;
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Lấy dữ liệu Dashboard dành cho Admin.
    /// Bao gồm các thông tin thống kê tổng quan của hệ thống.
    /// </summary>
    public async Task<ServiceResult<AdminDashboardResponse>> GetDashboardAsync()
    {
        try
        {
            // Lấy toàn bộ dữ liệu cần thiết từ database
            var users = await _userRepo.GetAllAsync();
            var referees = await _refereeRepo.GetAllAsync();
            var tournaments = await _tournamentRepo.GetActiveAsync();
            var races = await _raceRepo.GetAllAsync();
            var registrations = await _registrationRepo.GetPendingAsync();

            // Tạo DTO trả về Dashboard
            var response = new AdminDashboardResponse
            {
                // Tổng số người dùng
                TotalUsers = users.Count(),

                // Tổng số trọng tài
                TotalReferees = referees.Count(),

                // Tổng số giải đấu đang hoạt động
                ActiveTournaments = tournaments.Count(),

                // Tổng số cuộc đua chưa bắt đầu
                UpcomingRaces = races.Count(r => r.Status == RaceStatus.Scheduled),

                // Tổng số yêu cầu đăng ký đang chờ duyệt
                PendingRegistrations = registrations.Count(),

                // Tổng số cuộc đua đang diễn ra
                OngoingRaces = races.Count(r => r.Status == RaceStatus.InProgress)
            };

            // Trả dữ liệu thành công
            return ServiceResult<AdminDashboardResponse>.Ok(response);
        }
        catch (Exception ex)
        {
            // Trả lỗi nếu xảy ra exception
            return ServiceResult<AdminDashboardResponse>.Fail(
                500,
                $"Error loading dashboard: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy danh sách toàn bộ User trong hệ thống.
    /// Chỉ trả về các thông tin cần thiết thông qua DTO.
    /// </summary>
    public async Task<ServiceResult<IEnumerable<UserManagementResponse>>> GetAllUsersAsync()
    {
        try
        {
            // Lấy tất cả User
            var users = await _userRepo.GetAllAsync();

            // Chuyển Entity sang DTO
            var response = users.Select(u => new UserManagementResponse
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role.ToString(),

                // Nếu User chưa có Horse thì trả về 0
                HorseCount = u.Horses?.Count ?? 0,

                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            });

            // Trả danh sách User
            return ServiceResult<IEnumerable<UserManagementResponse>>.Ok(response);
        }
        catch (Exception ex)
        {
            // Trả lỗi nếu không lấy được danh sách User
            return ServiceResult<IEnumerable<UserManagementResponse>>.Fail(
                500,
                $"Error retrieving users: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một User theo Id.
    /// </summary>
    public async Task<ServiceResult<UserManagementResponse>> GetUserAsync(Guid userId)
    {
        try
        {
            // Tìm User theo Id
            var user = await _userRepo.GetByIdAsync(userId);

            // Nếu không tồn tại thì trả về lỗi 404
            if (user == null)
            {
                return ServiceResult<UserManagementResponse>.Fail(
                    404,
                    "User not found");
            }

            // Chuyển Entity sang DTO
            var response = new UserManagementResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                HorseCount = user.Horses?.Count ?? 0,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };

            // Trả thông tin User
            return ServiceResult<UserManagementResponse>.Ok(response);
        }
        catch (Exception ex)
        {
            // Trả lỗi nếu xảy ra Exception
            return ServiceResult<UserManagementResponse>.Fail(
                500,
                $"Error retrieving user: {ex.Message}");
        }
    }

    /// <summary>
    /// Khóa tài khoản User bằng cách chuyển IsActive thành false.
    /// Không xóa dữ liệu khỏi database.
    /// </summary>
    public async Task<ServiceResult<bool>> DeactivateUserAsync(Guid userId)
    {
        try
        {
            // Tìm User theo Id
            var user = await _userRepo.GetByIdAsync(userId);

            // Nếu không tồn tại thì trả lỗi
            if (user == null)
            {
                return ServiceResult<bool>.Fail(
                    404,
                    "User not found");
            }

            // Khóa tài khoản
            user.IsActive = false;

            // Cập nhật dữ liệu
            await _userRepo.UpdateAsync(user);

            // Lưu xuống database
            await _unitOfWork.SaveChangesAsync();

            // Thành công
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            // Trả lỗi nếu xảy ra Exception
            return ServiceResult<bool>.Fail(
                500,
                $"Error deactivating user: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ReactivateUserAsync(Guid userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<bool>.Fail(404, "User not found");
            }

            user.IsActive = true;
            await _userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error reactivating user: {ex.Message}");
        }
    }

    public async Task<ServiceResult<UserRegistrationResponse>> GetRegistrationAsync(Guid id)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(id);
            if (registration == null)
            {
                return ServiceResult<UserRegistrationResponse>.Fail(404, "Registration not found");
            }

            return ServiceResult<UserRegistrationResponse>.Ok(MapToResponse(registration));
        }
        catch (Exception ex)
        {
            return ServiceResult<UserRegistrationResponse>.Fail(500, $"Error retrieving registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetPendingRegistrationsAsync()
    {
        try
        {
            var registrations = await _registrationRepo.GetPendingAsync();
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500, $"Error retrieving pending registrations: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetAllRegistrationsAsync()
    {
        try
        {
            var registrations = await _registrationRepo.GetAllAsync();
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500, $"Error retrieving registrations: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ApproveRegistrationAsync(ApproveRegistrationRequest request)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            // Create new user
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = registration.Email,
                FullName = registration.FullName,
                PasswordHash = string.Empty,
                Role = registration.RequestedRole,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);

            await _userRepo.AddAsync(newUser);

            // Update registration
            registration.Status = RegistrationStatus.Approved;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ApprovedUserId = newUser.Id;
            registration.AdminNotes = request.AdminNotes;

            await _registrationRepo.UpdateAsync(registration);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error approving registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RejectRegistrationAsync(RejectRegistrationRequest request)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            registration.Status = RegistrationStatus.Rejected;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.RejectionReason = request.RejectionReason;
            registration.AdminNotes = request.AdminNotes;

            await _registrationRepo.UpdateAsync(registration);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error rejecting registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ApproveHorseAsync(Guid horseId)
    {
        try
        {
            var horse = await _horseRepo.GetByIdAsync(horseId);
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Horse not found");
            }
            horse.ApprovalStatus = ApprovalStatus.Approved;
            horse.ApprovalNote = null;
            await _horseRepo.UpdateAsync(horse);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error approving horse: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RejectHorseAsync(Guid horseId, string reason)
    {
        try
        {
            var horse = await _horseRepo.GetByIdAsync(horseId);
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Horse not found");
            }
            horse.ApprovalStatus = ApprovalStatus.Rejected;
            horse.ApprovalNote = reason;
            await _horseRepo.UpdateAsync(horse);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error rejecting horse: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ApproveJockeyAsync(Guid jockeyId)
    {
        try
        {
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }
            jockey.ApprovalStatus = ApprovalStatus.Approved;
            jockey.ApprovalNote = null;
            await _jockeyRepo.UpdateAsync(jockey);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error approving jockey: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RejectJockeyAsync(Guid jockeyId, string reason)
    {
        try
        {
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }
            jockey.ApprovalStatus = ApprovalStatus.Rejected;
            jockey.ApprovalNote = reason;
            await _jockeyRepo.UpdateAsync(jockey);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error rejecting jockey: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RefereeAssignmentResponse>> AssignRefereeToRaceAsync(AssignRefereeRequest request)
    {
        return await _refereeService.AssignRefereeToRaceAsync(request);
    }

    public async Task<ServiceResult<bool>> PublishRaceResultAsync(Guid raceId, RaceResultRequest request)
    {
        return await _liveResultService.UpdateRaceResultAsync(raceId, request);
    }

    private UserRegistrationResponse MapToResponse(UserRegistration registration)
    {
        return new UserRegistrationResponse
        {
            Id = registration.Id,
            Email = registration.Email,
            FullName = registration.FullName,
            RequestedRole = registration.RequestedRole.ToString(),
            Description = registration.Description,
            DocumentUrl = registration.DocumentUrl,
            Status = registration.Status.ToString(),
            SubmittedAt = registration.SubmittedAt,
            ReviewedAt = registration.ReviewedAt,
            ReviewedByUserName = registration.ReviewedByUser?.FullName,
            RejectionReason = registration.RejectionReason,
            AdminNotes = registration.AdminNotes
        };
    }
}
