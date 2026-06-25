using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

/// <summary>
/// API xác thực người dùng
/// Bao gồm đăng ký tài khoản và đăng nhập hệ thống
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // Service xử lý nghiệp vụ Authentication
    private readonly IAuthService _authService;

    /// <summary>
    /// Constructor inject AuthService
    /// </summary>
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// POST: api/auth/register
    /// </summary>
    /// <param name="request">
    /// Thông tin đăng ký:
    /// - FullName
    /// - Email
    /// - Password
    /// - Role (HorseOwner, Jockey, Referee, ...)
    /// </param>
    /// <returns>
    /// Thông tin người dùng và JWT Token (nếu hệ thống hỗ trợ)
    /// </returns>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request)
    {
        // Gọi service xử lý đăng ký
        var result = await _authService.RegisterAsync(request);

        // Trả về status code và dữ liệu
        return StatusCode(result.StatusCode, result.Result);
    }

    /// <summary>
    /// Đăng nhập hệ thống
    /// POST: api/auth/login
    /// </summary>
    /// <param name="request">
    /// Thông tin đăng nhập:
    /// - Email
    /// - Password
    /// </param>
    /// <returns>
    /// JWT Token và thông tin user
    /// </returns>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request)
    {
        // Kiểm tra email và mật khẩu
        var result = await _authService.LoginAsync(request);

        // Trả về JWT Token nếu đăng nhập thành công
        return StatusCode(result.StatusCode, result.Result);
    }
}