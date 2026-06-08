using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HorseRacing.Dtos;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Get all notifications for the current user
    /// </summary>
    [HttpGet("user")]
    public async Task<IActionResult> GetUserNotifications()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
            var result = await _notificationService.GetUserNotificationsAsync(userId);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting user notifications: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error retrieving notifications" });
        }
    }

    /// <summary>
    /// Get unread notifications for the current user
    /// </summary>
    [HttpGet("unread")]
    public async Task<IActionResult> GetUnreadNotifications()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
            var result = await _notificationService.GetUnreadNotificationsAsync(userId);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting unread notifications: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error retrieving notifications" });
        }
    }

    /// <summary>
    /// Get notifications with filter
    /// </summary>
    [HttpPost("filter")]
    public async Task<IActionResult> GetNotificationsWithFilter([FromBody] NotificationFilterDto filter)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
            var result = await _notificationService.GetNotificationsWithFilterAsync(userId, filter);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error filtering notifications: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error filtering notifications" });
        }
    }

    /// <summary>
    /// Get notification by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetNotificationById(Guid id)
    {
        try
        {
            var result = await _notificationService.GetNotificationByIdAsync(id);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            if (result.StatusCode == 404)
                return NotFound(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting notification: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error retrieving notification" });
        }
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    [HttpPut("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        try
        {
            var result = await _notificationService.MarkAsReadAsync(id);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            if (result.StatusCode == 404)
                return NotFound(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error marking notification as read: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error marking notification as read" });
        }
    }

    /// <summary>
    /// Mark multiple notifications as read
    /// </summary>
    [HttpPost("mark-multiple-read")]
    public async Task<IActionResult> MarkMultipleAsRead([FromBody] MarkNotificationsAsReadDto dto)
    {
        try
        {
            var result = await _notificationService.MarkMultipleAsReadAsync(dto);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error marking notifications as read: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error marking notifications as read" });
        }
    }

    /// <summary>
    /// Delete notification
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        try
        {
            var result = await _notificationService.DeleteNotificationAsync(id);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            if (result.StatusCode == 404)
                return NotFound(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting notification: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error deleting notification" });
        }
    }

    /// <summary>
    /// Get unread notification count for current user
    /// </summary>
    [HttpGet("count/unread")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
            var result = await _notificationService.GetUnreadCountAsync(userId);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting unread count: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error retrieving unread count" });
        }
    }

    /// <summary>
    /// Get notification statistics for current user
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetNotificationStats()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
            var result = await _notificationService.GetNotificationStatsAsync(userId);

            if (result.StatusCode == 200)
                return Ok(result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting notification stats: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error retrieving stats" });
        }
    }

    /// <summary>
    /// Admin endpoint - Create notification (Admin only)
    /// </summary>
    [HttpPost("create")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationDto dto)
    {
        try
        {
            var result = await _notificationService.CreateNotificationAsync(dto);

            if (result.StatusCode == 201)
                return StatusCode(201, result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating notification: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error creating notification" });
        }
    }

    /// <summary>
    /// Admin endpoint - Send bulk notifications
    /// </summary>
    [HttpPost("bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SendBulkNotifications([FromBody] BulkNotificationDto dto)
    {
        try
        {
            var result = await _notificationService.SendBulkNotificationsAsync(dto);

            if (result.StatusCode == 201)
                return StatusCode(201, result.Result);

            return StatusCode(result.StatusCode, result.Result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending bulk notifications: {ex.Message}");
            return StatusCode(500, new ApiResult<object> { Success = false, Message = "Error sending bulk notifications" });
        }
    }
}
