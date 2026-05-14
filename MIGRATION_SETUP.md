# Database Migration & Setup Guide

## 🚀 Setup Instructions

### **Step 1: Create Entity Framework Migration**

Open PowerShell in the BE directory and run:

```powershell
# Create migration
dotnet ef migrations add AddNotificationAndAuditLogging --context ApplicationDbContext

# Check the migration file (should be in Migrations folder)
# Review the generated SQL to ensure it's correct
```

### **Step 2: Apply Migration to Database**

```powershell
# Update the database
dotnet ef database update

# Verify tables were created
# SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='dbo'
```

### **Step 3: Verify Table Creation**

Run these SQL queries to verify the tables exist:

```sql
-- Check Notifications table
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME='Notifications' AND TABLE_SCHEMA='dbo'

-- Check AuditLogs table
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME='AuditLogs' AND TABLE_SCHEMA='dbo'

-- Check indexes
SELECT * FROM sys.indexes 
WHERE object_id = OBJECT_ID('dbo.Notifications')

SELECT * FROM sys.indexes 
WHERE object_id = OBJECT_ID('dbo.AuditLogs')
```

---

## 📊 Expected Database Schema

### **Notifications Table Structure**
```
Column Name          | Data Type         | Nullable | PK | FK | Indexes
--------------------|-------------------|----------|----|----|----------
Id                   | UNIQUEIDENTIFIER  | No       | ✓  |    |
UserId               | UNIQUEIDENTIFIER  | No       |    | ✓  | IX_UserId
Title                | NVARCHAR(500)     | No       |    |    |
Message              | NVARCHAR(2000)    | No       |    |    |
Type                 | NVARCHAR(MAX)     | No       |    |    |
Category             | NVARCHAR(MAX)     | No       |    |    |
ActionUrl            | NVARCHAR(500)     | Yes      |    |    |
RelatedEntityId      | UNIQUEIDENTIFIER  | Yes      |    |    |
RelatedEntityType    | NVARCHAR(100)     | Yes      |    |    |
IsRead               | BIT               | No       |    |    | IX_IsRead
ReadAt               | DATETIME2         | Yes      |    |    |
CreatedAt            | DATETIME2         | No       |    |    |
SentAt               | DATETIME2         | Yes      |    |    |
IsSent               | BIT               | No       |    |    |
FailureReason        | NVARCHAR(500)     | Yes      |    |    |
RetryCount           | INT               | Yes      |    |    |
IsDeleted            | BIT               | No       |    |    |
```

### **AuditLogs Table Structure**
```
Column Name          | Data Type         | Nullable | PK | FK | Indexes
--------------------|-------------------|----------|----|----|----------
Id                   | UNIQUEIDENTIFIER  | No       | ✓  |    |
AdminId              | UNIQUEIDENTIFIER  | No       |    | ✓  | IX_AdminId
EntityType           | NVARCHAR(100)     | No       |    |    | IX_EntityType
EntityId             | UNIQUEIDENTIFIER  | No       |    |    |
Action               | NVARCHAR(MAX)     | No       |    |    |
OldValues            | NVARCHAR(2000)    | Yes      |    |    |
NewValues            | NVARCHAR(2000)    | Yes      |    |    |
Description          | NVARCHAR(500)     | Yes      |    |    |
IpAddress            | NVARCHAR(100)     | Yes      |    |    |
UserAgent            | NVARCHAR(500)     | Yes      |    |    |
CreatedAt            | DATETIME2         | No       |    |    | IX_CreatedAt
ChangesSummary       | NVARCHAR(500)     | Yes      |    |    |
UserId               | UNIQUEIDENTIFIER  | Yes      |    | ✓  |
```

---

## ✅ Integration Checklist

### **Phase 1: Database Setup (1-2 hours)**
- [ ] Review migration file before applying
- [ ] Backup current database
- [ ] Create migration and apply to database
- [ ] Verify tables and indexes exist
- [ ] Test data retrieval from new tables

### **Phase 2: Code Integration (2-4 hours)**
- [ ] Ensure all dependencies registered in Program.cs
- [ ] Verify services can be injected properly
- [ ] Run application and check for compilation errors
- [ ] Test endpoints via Swagger/Postman

### **Phase 3: Feature Implementation (2-4 hours)**
- [ ] Add notification hooks to existing services (approval processes)
- [ ] Add audit logging to all admin operations
- [ ] Test notification creation and retrieval
- [ ] Test audit log creation and queries

### **Phase 4: Provider Integration (4-8 hours)**
- [ ] Set up email provider (SendGrid/AWS SES)
- [ ] Set up SMS provider (Twilio)
- [ ] Set up push notifications (Firebase)
- [ ] Implement background job processor (Hangfire)

### **Phase 5: Testing & Deployment (4-8 hours)**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Load testing
- [ ] Staging environment deployment
- [ ] Production deployment

---

## 🔧 Next Steps for Notification Provider Integration

### **Email Notifications (SendGrid Example)**

1. Install NuGet package:
```bash
dotnet add package SendGrid
```

2. Create email service:
```csharp
public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlContent);
}

public class EmailService : IEmailService
{
    private readonly SendGridClient _sendGridClient;
    
    public EmailService(IConfiguration configuration)
    {
        var apiKey = configuration["SendGrid:ApiKey"];
        _sendGridClient = new SendGridClient(apiKey);
    }
    
    public async Task SendEmailAsync(string to, string subject, string htmlContent)
    {
        var from = new EmailAddress("noreply@horsеracing.com", "Horse Racing");
        var toEmail = new EmailAddress(to);
        var msg = new SendGridMessage()
        {
            From = from,
            Subject = subject,
            HtmlContent = htmlContent
        };
        msg.AddTo(toEmail);
        
        await _sendGridClient.SendEmailAsync(msg);
    }
}
```

3. Register in Program.cs:
```csharp
builder.Services.AddScoped<IEmailService, EmailService>();
```

4. Update NotificationService to use it:
```csharp
if (notification.Type == NotificationType.Email)
{
    await _emailService.SendEmailAsync(user.Email, notification.Title, notification.Message);
}
```

### **SMS Notifications (Twilio Example)**

1. Install NuGet package:
```bash
dotnet add package Twilio
```

2. Create SMS service:
```csharp
public interface ISmsService
{
    Task SendSmsAsync(string phoneNumber, string message);
}

public class SmsService : ISmsService
{
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _twilioPhoneNumber;
    
    public SmsService(IConfiguration configuration)
    {
        _accountSid = configuration["Twilio:AccountSid"];
        _authToken = configuration["Twilio:AuthToken"];
        _twilioPhoneNumber = configuration["Twilio:PhoneNumber"];
        TwilioClient.Init(_accountSid, _authToken);
    }
    
    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        var msg = await MessageResource.CreateAsync(
            body: message,
            from: new Twilio.Types.PhoneNumber(_twilioPhoneNumber),
            to: new Twilio.Types.PhoneNumber(phoneNumber)
        );
    }
}
```

### **Push Notifications (Firebase Example)**

1. Install NuGet package:
```bash
dotnet add package FirebaseAdmin
```

2. Create push service:
```csharp
public interface IPushNotificationService
{
    Task SendPushAsync(string deviceToken, string title, string body);
}

public class PushNotificationService : IPushNotificationService
{
    private readonly FirebaseMessaging _firebaseMessaging;
    
    public PushNotificationService()
    {
        _firebaseMessaging = FirebaseMessaging.DefaultInstance;
    }
    
    public async Task SendPushAsync(string deviceToken, string title, string body)
    {
        var message = new Message()
        {
            Notification = new Notification()
            {
                Title = title,
                Body = body
            },
            Token = deviceToken
        };
        
        await _firebaseMessaging.SendAsync(message);
    }
}
```

---

## 🗄️ Backup & Recovery

### **Before Migration**

```sql
-- Backup database
BACKUP DATABASE HorseRacing 
TO DISK = 'C:\Backups\HorseRacing_PreMigration.bak'

-- Create transaction log backup
BACKUP LOG HorseRacing 
TO DISK = 'C:\Backups\HorseRacing_PreMigration.trn'
```

### **If Issues Occur**

```powershell
# Rollback migration (if not yet deployed)
dotnet ef migrations remove

# Or rollback database to previous state
# Restore from backup
```

---

## 🧪 Testing the Setup

### **Test Notification Creation**

```csharp
[Test]
public async Task TestCreateNotification()
{
    var dto = new CreateNotificationDto
    {
        UserId = Guid.NewGuid(),
        Title = "Test Notification",
        Message = "This is a test",
        Type = NotificationType.InApp,
        Category = NotificationCategory.SystemAlert
    };
    
    var result = await _notificationService.CreateNotificationAsync(dto);
    
    Assert.IsTrue(result.Result.Success);
    Assert.AreEqual(201, result.StatusCode);
}
```

### **Test Audit Log Creation**

```csharp
[Test]
public async Task TestCreateAuditLog()
{
    var dto = new CreateAuditLogDto
    {
        AdminId = Guid.NewGuid(),
        EntityType = "User",
        EntityId = Guid.NewGuid(),
        Action = AuditAction.Create,
        Description = "Test audit"
    };
    
    var result = await _auditLogService.LogActionAsync(dto);
    
    Assert.IsTrue(result.Result.Success);
    Assert.AreEqual(201, result.StatusCode);
}
```

---

## 📈 Performance Considerations

### **Notification Table Growth**
- Estimated: 5,000-10,000 notifications per day in production
- Strategy: Archive/delete read notifications older than 90 days
- Storage: ~1-2 GB per 1 million notifications

### **Audit Log Table Growth**
- Estimated: 1,000-5,000 audit logs per day depending on admin activity
- Strategy: Keep 1 year of logs, archive older logs
- Storage: ~500 MB per 1 million audit logs

### **Index Maintenance**
```sql
-- Rebuild fragmented indexes
ALTER INDEX IX_Notifications_UserId ON Notifications REBUILD
ALTER INDEX IX_Notifications_IsRead ON Notifications REBUILD
ALTER INDEX IX_AuditLogs_AdminId ON AuditLogs REBUILD
ALTER INDEX IX_AuditLogs_EntityType ON AuditLogs REBUILD
ALTER INDEX IX_AuditLogs_CreatedAt ON AuditLogs REBUILD

-- Check fragmentation
SELECT * FROM sys.dm_db_index_physical_stats(
    DB_ID(),
    OBJECT_ID('Notifications'),
    NULL,
    NULL,
    'LIMITED'
)
```

---

## 🚨 Troubleshooting

### **Issue: Migration Won't Apply**
```
Solution: 
1. Check connection string in appsettings.json
2. Ensure database exists
3. Check user has sufficient permissions
4. Run: dotnet ef migrations remove, then create new migration
```

### **Issue: Foreign Key Constraint Error**
```
Solution:
1. Verify Users table exists and contains valid data
2. Check OnDelete behavior in DbContext configuration
3. Clear existing test data and retry
```

### **Issue: Notification Service Throws Exception**
```
Solution:
1. Verify NotificationRepository is registered in DI
2. Check IUnitOfWork is registered
3. Ensure DbContext has Notifications DbSet
4. Run: dotnet ef migrations add, then dotnet ef database update
```

---

## 📋 Deployment Checklist

- [ ] Database migrations applied successfully
- [ ] All services registered in Program.cs
- [ ] Controllers accessible via Swagger
- [ ] Email/SMS/Push providers configured
- [ ] Background job processor running
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Load tests completed
- [ ] Security audit completed
- [ ] Documentation complete
- [ ] Team trained on new features
- [ ] Monitoring/alerting configured
- [ ] Rollback plan documented

---

**Migration Version**: 1.0  
**Created**: May 14, 2026  
**Estimated Deployment Time**: 2-3 days
