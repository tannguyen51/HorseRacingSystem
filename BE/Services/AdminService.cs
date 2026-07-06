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

    /// <summary>
    /// Mở khóa tài khoản User bằng cách chuyển IsActive thành true.
    /// </summary>
    public async Task<ServiceResult<bool>> ReactivateUserAsync(Guid userId)
    {
        try
        {
            // Tìm User theo Id
            var user = await _userRepo.GetByIdAsync(userId);

            // Nếu User không tồn tại thì trả về lỗi 404
            if (user == null)
            {
                return ServiceResult<bool>.Fail(404, "User not found");
            }

            // Kích hoạt lại tài khoản
            user.IsActive = true;

            // Cập nhật thông tin User
            await _userRepo.UpdateAsync(user);

            // Lưu thay đổi xuống Database
            await _unitOfWork.SaveChangesAsync();

            // Trả về thành công
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            // Trả về lỗi nếu xảy ra Exception
            return ServiceResult<bool>.Fail(500, $"Error reactivating user: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một yêu cầu đăng ký theo Id.
    /// </summary>
    public async Task<ServiceResult<UserRegistrationResponse>> GetRegistrationAsync(Guid id)
    {
        try
        {
            // Tìm Registration theo Id
            var registration = await _registrationRepo.GetByIdAsync(id);

            // Nếu không tồn tại thì trả về lỗi 404
            if (registration == null)
            {
                return ServiceResult<UserRegistrationResponse>.Fail(
                    404,
                    "Registration not found");
            }

            // Chuyển Entity sang DTO và trả về
            return ServiceResult<UserRegistrationResponse>.Ok(
                MapToResponse(registration));
        }
        catch (Exception ex)
        {
            // Trả về lỗi nếu xảy ra Exception
            return ServiceResult<UserRegistrationResponse>.Fail(
                500,
                $"Error retrieving registration: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy danh sách các Registration đang ở trạng thái Pending.
    /// Đây là các yêu cầu đang chờ Admin phê duyệt.
    /// </summary>
    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetPendingRegistrationsAsync()
    {
        try
        {
            // Lấy danh sách Registration đang chờ duyệt
            var registrations = await _registrationRepo.GetPendingAsync();

            // Chuyển từng Entity sang DTO và trả về
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            // Trả về lỗi nếu xảy ra Exception
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500,
                $"Error retrieving pending registrations: {ex.Message}");
        }
    }

    /// <summary>
    /// Lấy toàn bộ danh sách Registration.
    /// Bao gồm Pending, Approved và Rejected.
    /// </summary>
    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetAllRegistrationsAsync()
    {
        try
        {
            // Lấy toàn bộ Registration trong hệ thống
            var registrations = await _registrationRepo.GetAllAsync();

            // Chuyển sang DTO để trả về cho Client
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            // Trả về lỗi nếu xảy ra Exception
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500,
                $"Error retrieving registrations: {ex.Message}");
        }
    }

    /// <summary>
    /// Phê duyệt yêu cầu đăng ký tài khoản.
    /// Sau khi được duyệt sẽ tạo User mới và cập nhật trạng thái Registration.
    /// </summary>
    public async Task<ServiceResult<bool>> ApproveRegistrationAsync(ApproveRegistrationRequest request)
    {
        try
        {
            // Tìm Registration theo Id
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);

            // Kiểm tra Registration có tồn tại hay không
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            // Tạo User mới từ thông tin Registration
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = registration.Email,
                FullName = registration.FullName,

                // Password sẽ được Hash ngay bên dưới
                PasswordHash = string.Empty,

                // Gán Role mà người dùng đã đăng ký
                Role = registration.RequestedRole,

                // Tài khoản được kích hoạt ngay sau khi duyệt
                IsActive = true,

                // Thời gian tạo tài khoản
                CreatedAt = DateTime.UtcNow
            };

            // Mã hóa mật khẩu trước khi lưu vào Database
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);

            // Thêm User mới
            await _userRepo.AddAsync(newUser);

            // Cập nhật trạng thái Registration
            registration.Status = RegistrationStatus.Approved;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ApprovedUserId = newUser.Id;
            registration.AdminNotes = request.AdminNotes;

            // Lưu Registration
            await _registrationRepo.UpdateAsync(registration);

            // Lưu toàn bộ thay đổi xuống Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            // Trả về lỗi nếu xảy ra Exception
            return ServiceResult<bool>.Fail(
                500,
                $"Error approving registration: {ex.Message}");
        }
    }

    /// <summary>
    /// Từ chối yêu cầu đăng ký tài khoản.
    /// Cập nhật trạng thái Rejected và lưu lý do từ chối.
    /// </summary>
    public async Task<ServiceResult<bool>> RejectRegistrationAsync(RejectRegistrationRequest request)
    {
        try
        {
            // Tìm Registration theo Id
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);

            // Kiểm tra Registration có tồn tại hay không
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            // Cập nhật trạng thái từ chối
            registration.Status = RegistrationStatus.Rejected;

            // Lưu thời gian xử lý
            registration.ReviewedAt = DateTime.UtcNow;

            // Lưu lý do từ chối
            registration.RejectionReason = request.RejectionReason;

            // Ghi chú của Admin
            registration.AdminNotes = request.AdminNotes;

            // Cập nhật Registration
            await _registrationRepo.UpdateAsync(registration);

            // Lưu xuống Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(
                500,
                $"Error rejecting registration: {ex.Message}");
        }
    }

    /// <summary>
    /// Phê duyệt Horse.
    /// Chuyển trạng thái ApprovalStatus sang Approved.
    /// </summary>
    public async Task<ServiceResult<bool>> ApproveHorseAsync(Guid horseId)
    {
        try
        {
            // Tìm Horse theo Id
            var horse = await _horseRepo.GetByIdAsync(horseId);

            // Kiểm tra Horse có tồn tại không
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Horse not found");
            }

            // Cập nhật trạng thái phê duyệt
            horse.ApprovalStatus = ApprovalStatus.Approved;

            // Xóa ghi chú từ chối nếu có
            horse.ApprovalNote = null;

            // Cập nhật Horse
            await _horseRepo.UpdateAsync(horse);

            // Lưu Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(
                500,
                $"Error approving horse: {ex.Message}");
        }
    }

    /// <summary>
    /// Từ chối Horse.
    /// Lưu lý do từ chối vào ApprovalNote.
    /// </summary>
    public async Task<ServiceResult<bool>> RejectHorseAsync(Guid horseId, string reason)
    {
        try
        {
            // Tìm Horse theo Id
            var horse = await _horseRepo.GetByIdAsync(horseId);

            // Kiểm tra Horse có tồn tại không
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Horse not found");
            }

            // Chuyển trạng thái sang Rejected
            horse.ApprovalStatus = ApprovalStatus.Rejected;

            // Lưu lý do từ chối
            horse.ApprovalNote = reason;

            // Cập nhật Horse
            await _horseRepo.UpdateAsync(horse);

            // Lưu Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(
                500,
                $"Error rejecting horse: {ex.Message}");
        }
    }

    /// <summary>
    /// Phê duyệt Jockey.
    /// </summary>
    public async Task<ServiceResult<bool>> ApproveJockeyAsync(Guid jockeyId)
    {
        try
        {
            // Tìm Jockey theo Id
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);

            // Kiểm tra Jockey có tồn tại không
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }

            // Cập nhật trạng thái Approved
            jockey.ApprovalStatus = ApprovalStatus.Approved;

            // Xóa ghi chú cũ
            jockey.ApprovalNote = null;

            // Cập nhật dữ liệu
            await _jockeyRepo.UpdateAsync(jockey);

            // Lưu Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(
                500,
                $"Error approving jockey: {ex.Message}");
        }
    }

    /// <summary>
    /// Từ chối Jockey.
    /// Lưu lý do từ chối.
    /// </summary>
    public async Task<ServiceResult<bool>> RejectJockeyAsync(Guid jockeyId, string reason)
    {
        try
        {
            // Tìm Jockey theo Id
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);

            // Kiểm tra Jockey có tồn tại không
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }

            // Cập nhật trạng thái Rejected
            jockey.ApprovalStatus = ApprovalStatus.Rejected;

            // Lưu lý do từ chối
            jockey.ApprovalNote = reason;

            // Cập nhật dữ liệu
            await _jockeyRepo.UpdateAsync(jockey);

            // Lưu Database
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(
                500,
                $"Error rejecting jockey: {ex.Message}");
        }
    }

    /// <summary>
    /// Phân công trọng tài cho một cuộc đua.
    /// Logic xử lý được thực hiện trong RefereeService.
    /// </summary>
    public async Task<ServiceResult<RefereeAssignmentResponse>> AssignRefereeToRaceAsync(AssignRefereeRequest request)
    {
        return await _refereeService.AssignRefereeToRaceAsync(request);
    }

    /// <summary>
    /// Công bố hoặc cập nhật kết quả cuộc đua.
    /// Logic xử lý nằm trong LiveResultService.
    /// </summary>
    public async Task<ServiceResult<bool>> PublishRaceResultAsync(Guid raceId, RaceResultRequest request)
    {
        return await _liveResultService.UpdateRaceResultAsync(raceId, request);
    }

    /// <summary>
    /// Chuyển đổi Entity UserRegistration sang DTO UserRegistrationResponse.
    /// Giúp tái sử dụng code và tránh lặp khi trả dữ liệu.
    /// </summary>
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

            // Tên Admin đã xử lý Registration (nếu có)
            ReviewedByUserName = registration.ReviewedByUser?.FullName,

            // Lý do từ chối (nếu bị Reject)
            RejectionReason = registration.RejectionReason,

            // Ghi chú của Admin
            AdminNotes = registration.AdminNotes
        };
    }
}