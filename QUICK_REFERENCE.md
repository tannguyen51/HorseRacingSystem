# HorseRacing Backend - Quick Reference Guide

## 🚀 Quick Start for Developers

### **Notification System Quick Reference**

#### **1. Create a Notification**
```csharp
// Inject INotificationService
public class YourService
{
    private readonly INotificationService _notificationService;
    
    public async Task NotifyHorseApprovalAsync(Guid userId, Guid horseId, string horseName)
    {
        var dto = new CreateNotificationDto
        {
            UserId = userId,
            Title = "Horse Approved",
            Message = $"Your horse '{horseName}' has been approved for racing",
            Type = NotificationType.Email, // or SMS, PushNotification, InApp
            Category = NotificationCategory.HorseApproval,
            ActionUrl = $"/horses/{horseId}",
            RelatedEntityId = horseId,
            RelatedEntityType = "Horse"
        };
        
        var result = await _notificationService.CreateNotificationAsync(dto);
        if (!result.Result.Success)
        {
            // Handle error
        }
    }
}
```

#### **2. Get User Notifications**
```csharp
// In controller
[HttpGet]
public async Task<IActionResult> GetMyNotifications()
{
    var userId = Guid.Parse(User.FindFirst("UserId")?.Value ?? "");
    var result = await _notificationService.GetUserNotificationsAsync(userId);
    return Ok(result.Result);
}
```

#### **3. Send Bulk Notifications**
```csharp
// For system-wide announcements
var bulkDto = new BulkNotificationDto
{
    UserIds = new List<Guid> { userId1, userId2, userId3 },
    Title = "Important: System Maintenance",
    Message = "We will perform maintenance tomorrow from 2-4 AM UTC",
    Type = NotificationType.InApp,
    Category = NotificationCategory.SystemAlert
};

var result = await _notificationService.SendBulkNotificationsAsync(bulkDto);
```

#### **4. Filter Notifications**
```csharp
var filter = new NotificationFilterDto
{
    IsRead = false,
    Category = NotificationCategory.RaceResult,
    FromDate = DateTime.UtcNow.AddDays(-7),
    ToDate = DateTime.UtcNow,
    PageNumber = 1,
    PageSize = 20
};

var result = await _notificationService.GetNotificationsWithFilterAsync(userId, filter);
```

---

### **Audit Logging System Quick Reference**

#### **1. Log an Admin Action**
```csharp
// Inject IAuditLogService
public class AdminService
{
    private readonly IAuditLogService _auditLogService;
    
    public async Task ApproveUserRegistrationAsync(Guid adminId, Guid userId)
    {
        // ... approval logic ...
        
        var auditDto = new CreateAuditLogDto
        {
            AdminId = adminId,
            EntityType = "User",
            EntityId = userId,
            Action = AuditAction.Approve,
            Description = "Approved user registration",
            OldValues = JsonSerializer.Serialize(new { Status = "Pending" }),
            NewValues = JsonSerializer.Serialize(new { Status = "Approved" }),
            IpAddress = GetClientIpAddress(), // Get from HttpContext
            UserAgent = HttpContext.Request.Headers["User-Agent"].ToString(),
            UserId = userId
        };
        
        await _auditLogService.LogActionAsync(auditDto);
    }
}
```

#### **2. Get Audit History for Entity**
```csharp
// Track all changes to a user
var result = await _auditLogService.GetAuditLogsByEntityAsync("User", userId);

foreach (var log in result.Result.Data)
{
    Console.WriteLine($"Action: {log.Action} by {log.AdminEmail} on {log.CreatedAt}");
}
```

#### **3. Query Audit Logs with Filters**
```csharp
var filter = new AuditLogFilterDto
{
    AdminId = adminId,
    EntityType = "Horse",
    Action = AuditAction.Update,
    FromDate = DateTime.UtcNow.AddDays(-30),
    ToDate = DateTime.UtcNow,
    PageNumber = 1,
    PageSize = 100
};

var result = await _auditLogService.GetAuditLogsWithFilterAsync(filter);
```

#### **4. Export Audit Logs**
```csharp
var exportDto = new AuditExportDto
{
    FromDate = DateTime.UtcNow.AddDays(-90),
    ToDate = DateTime.UtcNow,
    EntityType = "User",
    Format = "csv" // or "json"
};

var result = await _auditLogService.ExportAuditLogsAsync(exportDto);
// result.Result.Data contains CSV/JSON string
```

#### **5. Get Audit Statistics**
```csharp
var stats = await _auditLogService.GetAuditStatsAsync();

Console.WriteLine($"Total Logs: {stats.Result.Data.TotalAuditLogs}");
Console.WriteLine($"Last Week: {stats.Result.Data.LastWeekCount}");
Console.WriteLine($"Last Month: {stats.Result.Data.LastMonthCount}");

foreach (var action in stats.Result.Data.ByAction)
{
    Console.WriteLine($"{action.Key}: {action.Value}");
}
```

---

## 📊 **Notification Categories Guide**

| Category | Use Case | Example |
|----------|----------|---------|
| RegistrationApproval | User registration approved/rejected | "Your registration has been approved" |
| HorseApproval | Horse registration approved/rejected | "Your horse has been approved for racing" |
| JockeyApproval | Jockey approval status | "Your jockey profile approved" |
| JockeyInvitation | Jockey invited to race | "You've been invited to race #123" |
| RaceAssignment | Race official assignments | "You've been assigned as Chief Referee" |
| RaceUpdate | Race schedule/status changes | "Race #123 has been rescheduled" |
| RaceResult | Race results announced | "Race #123 results are available" |
| ViolationRecord | Rule violation recorded | "Violation recorded in race #123" |
| HealthCheckResult | Horse health check results | "Your horse health check: Passed" |
| SystemAlert | System-wide alerts | "System maintenance scheduled" |
| Other | Other notifications | Custom messages |

---

## 📋 **Audit Actions Guide**

| Action | Meaning | Use When |
|--------|---------|----------|
| Create | Entity created | New user, horse, race registered |
| Update | Entity modified | Changing race details, updating user info |
| Delete | Entity removed | Removing a race entry |
| Approve | Entity approved | Approving registration, horse, jockey |
| Reject | Entity rejected | Rejecting application or registration |
| Activate | Entity enabled | Enabling a user account |
| Deactivate | Entity disabled | Disabling a user account |
| Assign | Entity assigned | Assigning referee to race |
| Login | User login | Track admin logins |
| Export | Data exported | Exporting reports |
| Other | Other action | Miscellaneous admin actions |

---

## 🔑 **Key Endpoints Summary**

### **Notification Endpoints**
```
GET    /api/notifications/user              - Get my notifications
GET    /api/notifications/unread            - Get unread notifications
POST   /api/notifications/filter            - Filter notifications
GET    /api/notifications/{id}              - Get notification
PUT    /api/notifications/{id}/mark-read    - Mark as read
POST   /api/notifications/mark-multiple-read - Batch mark read
DELETE /api/notifications/{id}              - Delete notification
GET    /api/notifications/count/unread      - Unread count
GET    /api/notifications/stats             - My stats
POST   /api/notifications/create            - Create (Admin)
POST   /api/notifications/bulk              - Bulk send (Admin)
```

### **Audit Log Endpoints**
```
GET    /api/auditlogs/{id}                  - Get log
GET    /api/auditlogs/admin/{adminId}       - By admin
GET    /api/auditlogs/entity/{type}/{id}    - Entity history
POST   /api/auditlogs/filter                - Filter logs
GET    /api/auditlogs/date-range            - Date range
GET    /api/auditlogs/user/{userId}         - By user
GET    /api/auditlogs/stats                 - Statistics
GET    /api/auditlogs/latest/{count}        - Latest logs
POST   /api/auditlogs/export                - Export (JSON/CSV)
DELETE /api/auditlogs/cleanup               - Cleanup old logs (Admin)
```

---

## 🛠️ **Helper Methods to Implement**

### **Get Client IP Address**
```csharp
private string GetClientIpAddress()
{
    if (HttpContext.Request.Headers.ContainsKey("X-Forwarded-For"))
        return HttpContext.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0];
    
    return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
}
```

### **Audit Log Helper**
```csharp
public async Task LogAuditAsync(string entityType, Guid entityId, AuditAction action, 
    object? oldValue, object? newValue, Guid adminId, string description = "")
{
    var dto = new CreateAuditLogDto
    {
        AdminId = adminId,
        EntityType = entityType,
        EntityId = entityId,
        Action = action,
        OldValues = oldValue != null ? JsonSerializer.Serialize(oldValue) : null,
        NewValues = newValue != null ? JsonSerializer.Serialize(newValue) : null,
        Description = description,
        IpAddress = GetClientIpAddress(),
        UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
    };
    
    await _auditLogService.LogActionAsync(dto);
}
```

---

## ⚡ **Common Implementation Patterns**

### **Pattern 1: Notify on Approval**
```csharp
// In ApprovalService
public async Task ApproveHorseAsync(Guid horseId, Guid approverAdminId)
{
    var horse = await _horseRepository.GetByIdAsync(horseId);
    
    // Update status
    horse.ApprovalStatus = ApprovalStatus.Approved;
    await _horseRepository.UpdateAsync(horse);
    
    // Log audit
    await LogAuditAsync("Horse", horseId, AuditAction.Approve, 
        new { Status = "Pending" }, new { Status = "Approved" }, 
        approverAdminId, $"Approved horse: {horse.Name}");
    
    // Notify owner
    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
    {
        UserId = horse.OwnerId,
        Title = "Horse Approved",
        Message = $"Your horse '{horse.Name}' has been approved!",
        Type = NotificationType.Email,
        Category = NotificationCategory.HorseApproval,
        RelatedEntityId = horseId,
        RelatedEntityType = "Horse"
    });
    
    await _unitOfWork.SaveChangesAsync();
}
```

### **Pattern 2: Track User Changes**
```csharp
// Before updating user
var oldUser = await _userRepository.GetByIdAsync(userId);
var oldJson = JsonSerializer.Serialize(oldUser);

// Update user
user.FullName = newName;
user.IsActive = newActive;
await _userRepository.UpdateAsync(user);

// Log changes
await LogAuditAsync("User", userId, AuditAction.Update,
    JsonSerializer.Deserialize<object>(oldJson),
    user,
    adminId, 
    $"Updated user: {newName}, Active: {newActive}");
```

### **Pattern 3: Bulk Notification**
```csharp
// Notify all admins
var adminUsers = await _userRepository.GetByRoleAsync(UserRole.Admin);
var adminIds = adminUsers.Select(u => u.Id).ToList();

await _notificationService.SendBulkNotificationsAsync(new BulkNotificationDto
{
    UserIds = adminIds,
    Title = "High Priority Alert",
    Message = "A critical race violation has been recorded",
    Type = NotificationType.PushNotification,
    Category = NotificationCategory.ViolationRecord
});
```

---

## 🧹 **Maintenance Tasks**

### **Weekly Tasks**
- Check failed notification count
- Monitor audit log growth rate
- Review recent admin actions

### **Monthly Tasks**
- Export audit logs for compliance
- Review most modified entities
- Analyze notification delivery rates

### **Quarterly Tasks**
- Clean up old notifications (90+ days)
- Archive old audit logs
- Review and optimize indexes
- Generate compliance report

---

## 📈 **Performance Tuning**

### **Notification Queries**
```csharp
// Bad: Gets all notifications then filters in memory
var all = await _repo.GetByUserIdAsync(userId);
var unread = all.Where(n => !n.IsRead).ToList(); // IN MEMORY

// Good: Filters at database level
var unread = await _repo.GetUnreadByUserIdAsync(userId); // DB QUERY
```

### **Audit Log Queries**
```csharp
// Bad: Gets all logs then filters
var allLogs = await _repo.GetAllAsync();
var recent = allLogs.Where(l => l.CreatedAt > oneWeekAgo).ToList();

// Good: Uses date index
var recent = await _repo.GetByDateRangeAsync(oneWeekAgo, DateTime.UtcNow);
```

---

**Version**: 1.0  
**Last Updated**: May 14, 2026
