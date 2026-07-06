using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace HorseRacing.Services;

/// <summary>
/// Service xử lý chức năng xác thực người dùng.
/// Bao gồm:
/// - Đăng ký tài khoản
/// - Đăng nhập
/// - Tạo JWT Token
/// </summary>
public class AuthService : IAuthService
{
    // Repository thao tác với bảng User
    private readonly IUserRepository _users;

    // Repository thao tác với bảng Jockey
    private readonly IJockeyRepository _jockeys;

    // UnitOfWork dùng để lưu thay đổi xuống Database
    private readonly IUnitOfWork _unitOfWork;

    // Service tạo JWT Token
    private readonly JwtTokenService _jwtTokenService;

    // Dùng để Hash và Verify mật khẩu
    private readonly PasswordHasher<User> _passwordHasher = new();

    /// <summary>
    /// Constructor sử dụng Dependency Injection.
    /// </summary>
    public AuthService(
        IUserRepository users,
        IJockeyRepository jockeys,
        IUnitOfWork unitOfWork,
        JwtTokenService jwtTokenService)
    {
        _users = users;
        _jockeys = jockeys;
        _unitOfWork = unitOfWork;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>
    /// Đăng ký tài khoản mới.
    /// Chỉ cho phép đăng ký các Role:
    /// HorseOwner, Jockey và Spectator.
    /// </summary>
    public async Task<ServiceResult<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        // Kiểm tra Role có hợp lệ hay không
        if (request.Role is not (UserRole.HorseOwner or UserRole.Jockey or UserRole.Spectator))
        {
            return ServiceResult<AuthResponse>.Fail(
                StatusCodes.Status400BadRequest,
                "Unsupported role.");
        }

        // Kiểm tra Email đã tồn tại hay chưa
        var exists = await _users.EmailExistsAsync(request.Email);

        if (exists)
        {
            return ServiceResult<AuthResponse>.Fail(
                StatusCodes.Status409Conflict,
                "Email already exists.");
        }

        // Khởi tạo User mới
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Role = request.Role,
            FullName = request.FullName,

            // Tài khoản được kích hoạt ngay sau khi đăng ký
            IsActive = true,

            // Lưu thời gian tạo tài khoản
            CreatedAt = DateTime.UtcNow
        };

        // Mã hóa mật khẩu trước khi lưu Database
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        // Thêm User vào Database
        await _users.AddAsync(user);

        // Nếu Role là Jockey thì tạo thêm hồ sơ Jockey
        if (request.Role == UserRole.Jockey)
        {
            var jockey = new Jockey
            {
                Id = Guid.NewGuid(),

                // Liên kết với User vừa tạo
                UserId = user.Id,

                // Số giấy phép hành nghề
                LicenseNumber = request.LicenseNumber,

                // Mặc định chờ Admin duyệt
                ApprovalStatus = ApprovalStatus.Pending
            };

            // Lưu Jockey
            await _jockeys.AddAsync(jockey);
        }

        // Lưu toàn bộ thay đổi xuống Database
        await _unitOfWork.SaveChangesAsync();

        // Sinh JWT Token cho User
        var token = _jwtTokenService.CreateToken(user);

        // Tạo dữ liệu trả về Client
        var response = new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        // Trả về kết quả thành công
        return ServiceResult<AuthResponse>.Ok(response);
    }

    /// <summary>
    /// Đăng nhập hệ thống.
    /// Kiểm tra Email, trạng thái tài khoản và mật khẩu.
    /// Nếu hợp lệ sẽ trả về JWT Token.
    /// </summary>
    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        // Tìm User theo Email
        var user = await _users.GetByEmailAsync(request.Email);

        // Không tìm thấy User
        if (user == null)
        {
            return ServiceResult<AuthResponse>.Fail(
                StatusCodes.Status401Unauthorized,
                "Invalid credentials.");
        }

        // Kiểm tra tài khoản có bị khóa hay không
        if (!user.IsActive)
        {
            return ServiceResult<AuthResponse>.Fail(
                StatusCodes.Status403Forbidden,
                "User is deactivated.");
        }

        // Kiểm tra mật khẩu
        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        // Sai mật khẩu
        if (result == PasswordVerificationResult.Failed)
        {
            return ServiceResult<AuthResponse>.Fail(
                StatusCodes.Status401Unauthorized,
                "Invalid credentials.");
        }

        // Sinh JWT Token sau khi đăng nhập thành công
        var token = _jwtTokenService.CreateToken(user);

        // Tạo dữ liệu trả về
        var response = new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            Token = token
        };

        // Trả kết quả thành công
        return ServiceResult<AuthResponse>.Ok(response);
    }
}