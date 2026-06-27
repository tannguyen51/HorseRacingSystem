-- ============================================================
-- HORSE RACING SYSTEM - SAMPLE DATA FOR DEMO
-- ============================================================
-- Users already registered via API. This script creates
-- profiles + tournament + race + all demo data.
-- Safe to re-run (uses WHERE NOT EXISTS on all INSERTs).
-- ============================================================

-- ============================================================
-- STEP 0: DELETE DATA (keep Users table)
-- ============================================================
DELETE FROM [dbo].[RaceReports];
DELETE FROM [dbo].[ViolationRecords];
DELETE FROM [dbo].[HorseHealthChecks];
DELETE FROM [dbo].[RefereeAssignments];
DELETE FROM [dbo].[Predictions];
DELETE FROM [dbo].[RaceResults];
DELETE FROM [dbo].[Protests];
DELETE FROM [dbo].[RaceEntries];
DELETE FROM [dbo].[JockeyInvitations];
DELETE FROM [dbo].[Contracts];
DELETE FROM [dbo].[HorseTransfers];
DELETE FROM [dbo].[InjuryRecords];
DELETE FROM [dbo].[Prizes];
DELETE FROM [dbo].[AuditLogs];
DELETE FROM [dbo].[Notifications];
DELETE FROM [dbo].[UserRegistrations];
DELETE FROM [dbo].[Races];
DELETE FROM [dbo].[Rounds];
DELETE FROM [dbo].[Tournaments];
DELETE FROM [dbo].[Horses];
DELETE FROM [dbo].[Referees];
DELETE FROM [dbo].[Jockeys];
DELETE FROM [dbo].[Owners];
GO

PRINT '>>> Cleanup done';
GO

-- ============================================================
-- ACTUAL USER GUIDs (from your DB)
-- ============================================================
-- Admin:     A2D85E47-39B5-4877-8E52-62FF26CD5F77
-- Owner:     F349AEF2-3832-4DD0-8715-319175E91129
-- Jockey:    AC124932-4E4A-42F4-B68B-2BAF4C4EBE94
-- Spectator: A3D50FBD-FFA8-43F7-B581-D1BD2E5F51F5
-- Referee:   B6C593F8-7756-4CAF-9F21-8D9D15A17350

-- ============================================================
-- STEP 1: OWNER (linked to HorseOwner user)
-- ============================================================
INSERT INTO [dbo].[Owners] ([Id], [UserId], [OwnerCode], [OrganizationName], [OwnerType], [Status], [JoinDate], [CreatedAt], [UpdatedAt])
SELECT '22222222-2222-2222-2222-222222222202', 'F349AEF2-3832-4DD0-8715-319175E91129', 'OWN-A1B2C3D4', N'Trang Trại Nguyễn Gia', 'Individual', 'Active', GETUTCDATE(), GETUTCDATE(), GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Owners] WHERE [UserId] = 'F349AEF2-3832-4DD0-8715-319175E91129');

PRINT '>>> Owner done';
GO

-- ============================================================
-- STEP 2: JOCKEY (pre-approved)
-- ============================================================
INSERT INTO [dbo].[Jockeys] ([Id], [UserId], [LicenseNumber], [DateOfBirth], [Gender], [Nationality], [Height], [Weight], [ExperienceYears], [TotalRaces], [TotalWins], [WinRate], [Rank], [Status], [ApprovalStatus], [CreatedAt], [UpdatedAt])
SELECT '33333333-3333-3333-3333-333333333302', 'AC124932-4E4A-42F4-B68B-2BAF4C4EBE94', 'LIC-J001', '1995-03-15', 'Male', N'Việt Nam', 168.00, 54.50, 8, 320, 85, 26.56, 12, 'Active', 1, GETUTCDATE(), GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Jockeys] WHERE [UserId] = 'AC124932-4E4A-42F4-B68B-2BAF4C4EBE94');

PRINT '>>> Jockey done';
GO

-- ============================================================
-- STEP 3: REFEREE
-- ============================================================
INSERT INTO [dbo].[Referees] ([Id], [UserId], [LicenseNumber], [Certifications], [LicenseExpiryDate], [IsActive], [Rating], [TotalOfficiated], [Specialization], [Nationality], [CreatedAt], [UpdatedAt])
SELECT '55555555-5555-5555-5555-555555555502', 'B6C593F8-7756-4CAF-9F21-8D9D15A17350', 'REF-LIC-001', 'VRC Level 3, FEI Certified', '2027-12-31', 1, 4.75, 150, 'Chief Referee', N'Việt Nam', GETUTCDATE(), GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Referees] WHERE [UserId] = 'B6C593F8-7756-4CAF-9F21-8D9D15A17350');

PRINT '>>> Referee done';
GO

-- ============================================================
-- STEP 4: HORSES
-- ============================================================
INSERT INTO [dbo].[Horses] ([HorseID], [Name], [Breed], [Gender], [DateOfBirth], [Age], [Weight], [Height], [Color], [TotalRaces], [TotalWins], [OwnerId], [ApprovalStatus])
SELECT 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', N'Chiến Mã', 'Thoroughbred', 'Stallion', '2020-04-10', 4, 520.00, 165.00, 'Bay', 18, 6, '22222222-2222-2222-2222-222222222202', 1
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Horses] WHERE [HorseID] = 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA');

INSERT INTO [dbo].[Horses] ([HorseID], [Name], [Breed], [Gender], [DateOfBirth], [Age], [TotalRaces], [TotalWins], [OwnerId], [ApprovalStatus])
SELECT 'AAAAAAA2-AAAA-AAAA-AAAA-AAAAAAAAAAAA', N'Phong Vân', 'Arabian', 'Mare', '2021-08-22', 3, 8, 2, '22222222-2222-2222-2222-222222222202', 0
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Horses] WHERE [HorseID] = 'AAAAAAA2-AAAA-AAAA-AAAA-AAAAAAAAAAAA');

PRINT '>>> Horses done';
GO

-- ============================================================
-- STEP 5: TOURNAMENT + ROUND + RACE
-- ============================================================
INSERT INTO [dbo].[Tournaments] ([Id], [Name], [StartDate], [EndDate], [Description], [Category], [Venue], [Country], [SurfaceType], [MaxRounds], [PrizePool], [IsActive], [CreatedAt])
SELECT 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', N'Giải Đua Ngựa Mùa Xuân 2026', '2026-06-20', '2026-07-20', N'Giải đua ngựa lớn nhất miền Bắc', 'Grade 1', N'Trường Đua Phú Thọ', N'Việt Nam', 'Turf', 3, 500000000.00, 1, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Tournaments] WHERE [Id] = 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB');

INSERT INTO [dbo].[Rounds] ([Id], [Name], [TournamentId], [RoundNumber], [ScheduledStartDate], [ScheduledEndDate], [Description])
SELECT 'CCCCCCC1-CCCC-CCCC-CCCC-CCCCCCCCCCCC', N'Vòng loại 1', 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 1, '2026-06-20', '2026-06-27', N'Vòng loại đầu tiên - Top 8 đi tiếp'
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Rounds] WHERE [Id] = 'CCCCCCC1-CCCC-CCCC-CCCC-CCCCCCCCCCCC');

INSERT INTO [dbo].[Races] ([Id], [Name], [TournamentId], [RoundId], [ScheduledAt], [Status], [Location], [MaxParticipants], [Distance], [CreatedAt])
SELECT 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', N'Đua 2000m - Bảng A', 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'CCCCCCC1-CCCC-CCCC-CCCC-CCCCCCCCCCCC', '2026-06-20 14:00:00', 'Scheduled', N'Đường đua Phú Thọ - Làn 1', 12, 2000, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Races] WHERE [Id] = 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD');

PRINT '>>> Tournament + Round + Race done';
GO

-- ============================================================
-- STEP 6: RACE ENTRY
-- ============================================================
INSERT INTO [dbo].[RaceEntries] ([Id], [RaceId], [HorseId], [JockeyId], [Status], [OwnerConfirmed], [JockeyConfirmed], [GateNumber], [WeightCarried])
SELECT 'EEEEEEE1-EEEE-EEEE-EEEE-EEEEEEEEEEEE', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', '33333333-3333-3333-3333-333333333302', 'Approved', 1, 1, 5, 56.00
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[RaceEntries] WHERE [Id] = 'EEEEEEE1-EEEE-EEEE-EEEE-EEEEEEEEEEEE');

PRINT '>>> RaceEntry done';
GO

-- ============================================================
-- STEP 7: JOCKEY INVITATION
-- ============================================================
INSERT INTO [dbo].[JockeyInvitations] ([Id], [HorseId], [JockeyId], [RaceId], [Status], [Message], [CreatedAt])
SELECT 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', '33333333-3333-3333-3333-333333333302', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'Accepted', N'Mời anh Nài cưỡi Chiến Mã tại giải Mùa Xuân 2026', GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[JockeyInvitations] WHERE [Id] = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF');

PRINT '>>> Invitation done';
GO

-- ============================================================
-- STEP 8: CONTRACT
-- ============================================================
INSERT INTO [dbo].[Contracts] ([Id], [OwnerId], [JockeyId], [HorseId], [Title], [Status], [StartDate], [EndDate], [BaseFee], [WinBonusPercent], [PerRaceFee], [TermsAndConditions], [SignedByOwnerAt], [SignedByJockeyAt], [CreatedAt])
SELECT '11111110-1111-1111-1111-111111111110', '22222222-2222-2222-2222-222222222202', '33333333-3333-3333-3333-333333333302', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', N'Hợp đồng cưỡi ngựa mùa Xuân 2026', 'Active', '2026-06-15', '2026-12-31', 15000000.00, 10.00, 5000000.00, N'Jockey cam kết cưỡi ngựa trong tất cả các giải đấu của chủ ngựa.', GETUTCDATE(), GETUTCDATE(), GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Contracts] WHERE [Id] = '11111110-1111-1111-1111-111111111110');

PRINT '>>> Contract done';
GO

-- ============================================================
-- STEP 9: REFEREE ASSIGNMENT
-- ============================================================
INSERT INTO [dbo].[RefereeAssignments] ([Id], [RaceId], [RefereeId], [Role], [Status], [AssignedAt])
SELECT '11111120-1111-1111-1111-111111111120', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', '55555555-5555-5555-5555-555555555502', 'Chief Referee', 'Assigned', GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[RefereeAssignments] WHERE [Id] = '11111120-1111-1111-1111-111111111120');

PRINT '>>> Assignment done';
GO

-- ============================================================
-- STEP 10: HEALTH CHECK
-- ============================================================
INSERT INTO [dbo].[HorseHealthChecks] ([Id], [HorseId], [RaceId], [RefereeId], [Status], [CheckedAt], [Observations], [Verdict], [ApprovedToRace])
SELECT '11111130-1111-1111-1111-111111111130', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', '55555555-5555-5555-5555-555555555502', 'Passed', GETUTCDATE(), N'Ngựa khỏe mạnh, không dấu hiệu chấn thương', N'Đủ điều kiện thi đấu', 1
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[HorseHealthChecks] WHERE [Id] = '11111130-1111-1111-1111-111111111130');

PRINT '>>> HealthCheck done';
GO

-- ============================================================
-- STEP 11: PREDICTION (Spectator)
-- ============================================================
INSERT INTO [dbo].[Predictions] ([Id], [RaceId], [SpectatorUserId], [PredictedHorseId], [Status], [BetAmount], [Odds], [PotentialPayout], [CreatedAt])
SELECT '11111140-1111-1111-1111-111111111140', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'A3D50FBD-FFA8-43F7-B581-D1BD2E5F51F5', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'Pending', 100000.00, 3.50, 350000.00, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Predictions] WHERE [Id] = '11111140-1111-1111-1111-111111111140');

PRINT '>>> Prediction done';
GO

-- ============================================================
-- STEP 12: RACE RESULT
-- ============================================================
INSERT INTO [dbo].[RaceResults] ([Id], [RaceId], [WinningHorseId], [TotalParticipants], [WinnerFinishTime], [RecordedAt], [IsDisputed], [IsOfficial], [WinnerPurse], [RankingsJson])
SELECT '11111150-1111-1111-1111-111111111150', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'AAAAAAA1-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 8, 125.4500, GETUTCDATE(), 0, 1, 50000000.00, '[{"position":1,"horseName":"Chiến Mã","finishTime":125.45},{"position":2,"horseName":"Phong Vân","finishTime":126.10}]'
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[RaceResults] WHERE [Id] = '11111150-1111-1111-1111-111111111150');

PRINT '>>> RaceResult done';
GO

-- ============================================================
-- STEP 13: VIOLATION
-- ============================================================
INSERT INTO [dbo].[ViolationRecords] ([Id], [RaceId], [RaceEntryId], [RefereeId], [ViolationType], [Description], [RecordedAt], [Evidence], [Penalty])
SELECT '11111160-1111-1111-1111-111111111160', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'EEEEEEE1-EEEE-EEEE-EEEE-EEEEEEEEEEEE', '55555555-5555-5555-5555-555555555502', 'FalseStart', N'Xuất phát trước tín hiệu khoảng 0.5 giây', GETUTCDATE(), N'Video replay tại mốc 0:05', N'Cảnh cáo lần 1'
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ViolationRecords] WHERE [Id] = '11111160-1111-1111-1111-111111111160');

PRINT '>>> Violation done';
GO

-- ============================================================
-- STEP 14: RACE REPORT
-- ============================================================
INSERT INTO [dbo].[RaceReports] ([Id], [RaceId], [RefereeId], [CompletedAt], [Details], [Incidents], [RecommendedActions], [IsOfficialReport], [WeatherCondition], [TrackCondition], [CreatedAt])
SELECT '11111170-1111-1111-1111-111111111170', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', '55555555-5555-5555-5555-555555555502', GETUTCDATE(), N'Cuộc đua diễn ra suôn sẻ', N'1 lần FalseStart bởi ngựa số 5', N'Tiếp tục theo dõi', 1, 'Sunny', 'Good', GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[RaceReports] WHERE [Id] = '11111170-1111-1111-1111-111111111170');

PRINT '>>> Report done';
GO

-- ============================================================
-- STEP 15: PROTEST (Jockey)
-- ============================================================
INSERT INTO [dbo].[Protests] ([Id], [RaceId], [FiledByUserId], [AgainstEntryId], [Reason], [Status], [FiledAt])
SELECT '11111180-1111-1111-1111-111111111180', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'AC124932-4E4A-42F4-B68B-2BAF4C4EBE94', 'EEEEEEE1-EEEE-EEEE-EEEE-EEEEEEEEEEEE', N'Nài ngựa số 3 cản trở ở khúc cua thứ 2', 'Pending', GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Protests] WHERE [Id] = '11111180-1111-1111-1111-111111111180');

PRINT '>>> Protest done';
GO

-- ============================================================
-- STEP 16: PRIZES
-- ============================================================
INSERT INTO [dbo].[Prizes] ([Id], [TournamentId], [RaceId], [Name], [Amount], [Currency], [Position], [PercentageOfPool], [Description], [SponsorName], [IsDistributed], [CreatedAt])
SELECT NEWID(), 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', N'Giải Nhất', 50000000.00, 'VND', 1, 60.00, N'Giải nhất cuộc đua 2000m', N'Vietcombank', 0, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Prizes] WHERE [TournamentId] = 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AND [Position] = 1);

INSERT INTO [dbo].[Prizes] ([Id], [TournamentId], [RaceId], [Name], [Amount], [Currency], [Position], [PercentageOfPool], [Description], [SponsorName], [IsDistributed], [CreatedAt])
SELECT NEWID(), 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', N'Giải Nhì', 25000000.00, 'VND', 2, 25.00, N'Giải nhì cuộc đua 2000m', N'Vietcombank', 0, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Prizes] WHERE [TournamentId] = 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AND [Position] = 2);

INSERT INTO [dbo].[Prizes] ([Id], [TournamentId], [RaceId], [Name], [Amount], [Currency], [Position], [PercentageOfPool], [Description], [SponsorName], [IsDistributed], [CreatedAt])
SELECT NEWID(), 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'DDDDDDD1-DDDD-DDDD-DDDD-DDDDDDDDDDDD', N'Giải Ba', 10000000.00, 'VND', 3, 15.00, N'Giải ba cuộc đua 2000m', N'Vietcombank', 0, GETUTCDATE()
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[Prizes] WHERE [TournamentId] = 'BBBBBBB1-BBBB-BBBB-BBBB-BBBBBBBBBBBB' AND [Position] = 3);

PRINT '>>> Prizes done';
GO

-- ============================================================
-- DONE
-- ============================================================
PRINT '========================================';
PRINT 'ALL SAMPLE DATA INSERTED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'LOGIN (use these in Swagger):';
PRINT '  Admin:     admin@demo.com     / Demo@123';
PRINT '  Owner:     owner@demo.com     / Demo@123';
PRINT '  Jockey:    jockey@demo.com    / Demo@123';
PRINT '  Spectator: spectator@demo.com / Demo@123';
PRINT '  Referee:   referee@demo.com   / Demo@123';
PRINT '========================================';
GO
