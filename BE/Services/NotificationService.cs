using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(INotificationRepository notificationRepository, IUnitOfWork unitOfWork)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<NotificationDto>> CreateNotificationAsync(CreateNotificationDto dto)
    {
        try
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                Category = dto.Category,
                ActionUrl = dto.ActionUrl,
                RelatedEntityId = dto.RelatedEntityId,
                RelatedEntityType = dto.RelatedEntityType,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                IsSent = false,
                RetryCount = 0
            };

            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<NotificationDto>
            {
                StatusCode = 201,
                Result = new ApiResult<NotificationDto>
                {
                    Success = true,
                    Data = MapToDto(notification),
                    Message = "Notification created successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<NotificationDto>
            {
                StatusCode = 500,
                Result = new ApiResult<NotificationDto>
                {
                    Success = false,
                    Message = $"Error creating notification: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<List<NotificationDto>>> GetUserNotificationsAsync(Guid userId)
    {
        try
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);
            var dtos = notifications.Select(n => MapToDto(n)).ToList();

            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 200,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Notifications retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 500,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = false,
                    Message = $"Error retrieving notifications: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<List<NotificationDto>>> GetUnreadNotificationsAsync(Guid userId)
    {
        try
        {
            var notifications = await _notificationRepository.GetUnreadByUserIdAsync(userId);
            var dtos = notifications.Select(n => MapToDto(n)).ToList();

            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 200,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Unread notifications retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 500,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = false,
                    Message = $"Error retrieving unread notifications: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<List<NotificationDto>>> GetNotificationsWithFilterAsync(Guid userId, NotificationFilterDto filter)
    {
        try
        {
            var notifications = await _notificationRepository.GetByUserIdWithFilterAsync(userId, filter);
            var dtos = notifications.Select(n => MapToDto(n)).ToList();

            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 200,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Filtered notifications retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 500,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = false,
                    Message = $"Error retrieving notifications: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<NotificationDetailDto>> GetNotificationByIdAsync(Guid id)
    {
        try
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return new ServiceResult<NotificationDetailDto>
                {
                    StatusCode = 404,
                    Result = new ApiResult<NotificationDetailDto>
                    {
                        Success = false,
                        Message = "Notification not found"
                    }
                };
            }

            return new ServiceResult<NotificationDetailDto>
            {
                StatusCode = 200,
                Result = new ApiResult<NotificationDetailDto>
                {
                    Success = true,
                    Data = MapToDetailDto(notification),
                    Message = "Notification retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<NotificationDetailDto>
            {
                StatusCode = 500,
                Result = new ApiResult<NotificationDetailDto>
                {
                    Success = false,
                    Message = $"Error retrieving notification: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<bool>> MarkAsReadAsync(Guid notificationId)
    {
        try
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null)
            {
                return new ServiceResult<bool>
                {
                    StatusCode = 404,
                    Result = new ApiResult<bool>
                    {
                        Success = false,
                        Message = "Notification not found"
                    }
                };
            }

            await _notificationRepository.MarkAsReadAsync(notificationId);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<bool>
            {
                StatusCode = 200,
                Result = new ApiResult<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Notification marked as read"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<bool>
            {
                StatusCode = 500,
                Result = new ApiResult<bool>
                {
                    Success = false,
                    Message = $"Error marking notification as read: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<bool>> MarkMultipleAsReadAsync(MarkNotificationsAsReadDto dto)
    {
        try
        {
            await _notificationRepository.MarkMultipleAsReadAsync(dto.NotificationIds);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<bool>
            {
                StatusCode = 200,
                Result = new ApiResult<bool>
                {
                    Success = true,
                    Data = true,
                    Message = $"{dto.NotificationIds.Count} notifications marked as read"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<bool>
            {
                StatusCode = 500,
                Result = new ApiResult<bool>
                {
                    Success = false,
                    Message = $"Error marking notifications as read: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<bool>> DeleteNotificationAsync(Guid notificationId)
    {
        try
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null)
            {
                return new ServiceResult<bool>
                {
                    StatusCode = 404,
                    Result = new ApiResult<bool>
                    {
                        Success = false,
                        Message = "Notification not found"
                    }
                };
            }

            await _notificationRepository.DeleteAsync(notificationId);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<bool>
            {
                StatusCode = 200,
                Result = new ApiResult<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Notification deleted successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<bool>
            {
                StatusCode = 500,
                Result = new ApiResult<bool>
                {
                    Success = false,
                    Message = $"Error deleting notification: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<int>> GetUnreadCountAsync(Guid userId)
    {
        try
        {
            var count = await _notificationRepository.GetUnreadCountByUserIdAsync(userId);

            return new ServiceResult<int>
            {
                StatusCode = 200,
                Result = new ApiResult<int>
                {
                    Success = true,
                    Data = count,
                    Message = "Unread count retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<int>
            {
                StatusCode = 500,
                Result = new ApiResult<int>
                {
                    Success = false,
                    Message = $"Error retrieving unread count: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<NotificationStatsDto>> GetNotificationStatsAsync(Guid userId)
    {
        try
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId);

            var stats = new NotificationStatsDto
            {
                TotalNotifications = notifications.Count,
                UnreadCount = notifications.Count(n => !n.IsRead),
                SentCount = notifications.Count(n => n.IsSent),
                FailedCount = notifications.Count(n => !n.IsSent && n.RetryCount >= 3),
                ByCategory = notifications
                    .GroupBy(n => n.Category.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                ByType = notifications
                    .GroupBy(n => n.Type.ToString())
                    .ToDictionary(g => g.Key, g => g.Count())
            };

            return new ServiceResult<NotificationStatsDto>
            {
                StatusCode = 200,
                Result = new ApiResult<NotificationStatsDto>
                {
                    Success = true,
                    Data = stats,
                    Message = "Stats retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<NotificationStatsDto>
            {
                StatusCode = 500,
                Result = new ApiResult<NotificationStatsDto>
                {
                    Success = false,
                    Message = $"Error retrieving stats: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<bool>> SendBulkNotificationsAsync(BulkNotificationDto dto)
    {
        try
        {
            foreach (var userId in dto.UserIds)
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Title = dto.Title,
                    Message = dto.Message,
                    Type = dto.Type,
                    Category = dto.Category,
                    ActionUrl = dto.ActionUrl,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    IsSent = false
                };

                await _notificationRepository.AddAsync(notification);
            }

            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<bool>
            {
                StatusCode = 201,
                Result = new ApiResult<bool>
                {
                    Success = true,
                    Data = true,
                    Message = $"Bulk notifications created for {dto.UserIds.Count} users"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<bool>
            {
                StatusCode = 500,
                Result = new ApiResult<bool>
                {
                    Success = false,
                    Message = $"Error sending bulk notifications: {ex.Message}"
                }
            };
        }
    }

    public async Task<ServiceResult<List<NotificationDto>>> GetNotificationsForEntityAsync(string entityType, Guid entityId)
    {
        try
        {
            var notifications = await _notificationRepository.GetByEntityAsync(entityType, entityId);
            var dtos = notifications.Select(n => MapToDto(n)).ToList();

            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 200,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = true,
                    Data = dtos,
                    Message = "Entity notifications retrieved successfully"
                }
            };
        }
        catch (Exception ex)
        {
            return new ServiceResult<List<NotificationDto>>
            {
                StatusCode = 500,
                Result = new ApiResult<List<NotificationDto>>
                {
                    Success = false,
                    Message = $"Error retrieving entity notifications: {ex.Message}"
                }
            };
        }
    }

    public async Task ProcessUnsentNotificationsAsync()
    {
        try
        {
            var unsentNotifications = await _notificationRepository.GetUnsentNotificationsAsync();

            // Simulate sending notifications (in production, integrate with actual email/SMS/push service)
            foreach (var notification in unsentNotifications)
            {
                try
                {
                    // TODO: Integrate with actual notification service (Email, SMS, Push)
                    // For now, just mark as sent
                    await _notificationRepository.MarkAsSentAsync(notification.Id);
                }
                catch (Exception ex)
                {
                    notification.RetryCount++;
                    notification.FailureReason = ex.Message;
                    await _notificationRepository.UpdateAsync(notification);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Error processing unsent notifications: {ex.Message}");
        }
    }

    private NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            Category = notification.Category,
            ActionUrl = notification.ActionUrl,
            RelatedEntityId = notification.RelatedEntityId,
            RelatedEntityType = notification.RelatedEntityType,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            CreatedAt = notification.CreatedAt,
            IsSent = notification.IsSent
        };
    }

    private NotificationDetailDto MapToDetailDto(Notification notification)
    {
        return new NotificationDetailDto
        {
            Id = notification.Id,
            UserId = notification.UserId,
            UserEmail = notification.User?.Email,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            Category = notification.Category,
            ActionUrl = notification.ActionUrl,
            RelatedEntityId = notification.RelatedEntityId,
            RelatedEntityType = notification.RelatedEntityType,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            CreatedAt = notification.CreatedAt,
            IsSent = notification.IsSent,
            RetryCount = notification.RetryCount ?? 0,
            FailureReason = notification.FailureReason
        };
    }
}
