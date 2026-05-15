using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class RefereeHealthCheckService : IRefereeHtmlCheckService
{
    private readonly IHealthCheckRepository _healthCheckRepo;
    private readonly IRaceRepository _raceRepo;
    private readonly IHorseRepository _horseRepo;
    private readonly IRefereeRepository _refereeRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RefereeHealthCheckService(
        IHealthCheckRepository healthCheckRepo,
        IRaceRepository raceRepo,
        IHorseRepository horseRepo,
        IRefereeRepository refereeRepo,
        IUnitOfWork unitOfWork)
    {
        _healthCheckRepo = healthCheckRepo;
        _raceRepo = raceRepo;
        _horseRepo = horseRepo;
        _refereeRepo = refereeRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<HealthCheckResponse>> CreateHealthCheckAsync(CreateHealthCheckRequest request)
    {
        try
        {
            var healthCheck = new HorseHealthCheck
            {
                Id = Guid.NewGuid(),
                HorseId = request.HorseId,
                RaceId = request.RaceId,
                RefereeId = request.RefereeId,
                Status = Enum.Parse<HealthCheckStatus>(request.HealthCheckStatus),
                CheckedAt = DateTime.UtcNow,
                Observations = request.Observations,
                ApprovedToRace = request.HealthCheckStatus == "Passed"
            };

            await _healthCheckRepo.AddAsync(healthCheck);
            await _unitOfWork.SaveChangesAsync();

            var horse = await _horseRepo.GetByIdAsync(request.HorseId);
            var race = await _raceRepo.GetByIdAsync(request.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(request.RefereeId);

            return ServiceResult<HealthCheckResponse>.Success(
                MapToResponse(healthCheck, horse, race, referee), 201);
        }
        catch (Exception ex)
        {
            return ServiceResult<HealthCheckResponse>.Error($"Error creating health check: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<HealthCheckResponse>> CompleteHealthCheckAsync(CompleteHealthCheckRequest request)
    {
        try
        {
            var healthCheck = await _healthCheckRepo.GetByIdAsync(request.HealthCheckId);
            if (healthCheck == null)
            {
                return ServiceResult<HealthCheckResponse>.Error("Health check not found", 404);
            }

            healthCheck.Status = Enum.Parse<HealthCheckStatus>(request.Status);
            healthCheck.Verdict = request.Verdict;
            healthCheck.ApprovedToRace = request.ApprovedToRace;

            await _healthCheckRepo.UpdateAsync(healthCheck);
            await _unitOfWork.SaveChangesAsync();

            var horse = await _horseRepo.GetByIdAsync(healthCheck.HorseId);
            var race = await _raceRepo.GetByIdAsync(healthCheck.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(healthCheck.RefereeId);

            return ServiceResult<HealthCheckResponse>.Success(
                MapToResponse(healthCheck, horse, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<HealthCheckResponse>.Error($"Error completing health check: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<HealthCheckResponse>> GetHealthCheckAsync(Guid id)
    {
        try
        {
            var healthCheck = await _healthCheckRepo.GetByIdAsync(id);
            if (healthCheck == null)
            {
                return ServiceResult<HealthCheckResponse>.Error("Health check not found", 404);
            }

            var horse = await _horseRepo.GetByIdAsync(healthCheck.HorseId);
            var race = await _raceRepo.GetByIdAsync(healthCheck.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(healthCheck.RefereeId);

            return ServiceResult<HealthCheckResponse>.Success(
                MapToResponse(healthCheck, horse, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<HealthCheckResponse>.Error($"Error retrieving health check: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<IEnumerable<HealthCheckResponse>>> GetRaceHealthChecksAsync(Guid raceId)
    {
        try
        {
            var healthChecks = await _healthCheckRepo.GetByRaceAsync(raceId);
            var race = await _raceRepo.GetByIdAsync(raceId);

            var responses = new List<HealthCheckResponse>();
            foreach (var hc in healthChecks)
            {
                var horse = await _horseRepo.GetByIdAsync(hc.HorseId);
                var referee = await _refereeRepo.GetByIdAsync(hc.RefereeId);
                responses.Add(MapToResponse(hc, horse, race, referee));
            }

            return ServiceResult<IEnumerable<HealthCheckResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<HealthCheckResponse>>.Error(
                $"Error retrieving health checks: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<IEnumerable<HealthCheckResponse>>> GetHorseHealthCheckHistoryAsync(Guid horseId)
    {
        try
        {
            var healthChecks = await _healthCheckRepo.GetByHorseAsync(horseId);
            var horse = await _horseRepo.GetByIdAsync(horseId);

            var responses = new List<HealthCheckResponse>();
            foreach (var hc in healthChecks)
            {
                var race = await _raceRepo.GetByIdAsync(hc.RaceId);
                var referee = await _refereeRepo.GetByIdAsync(hc.RefereeId);
                responses.Add(MapToResponse(hc, horse, race, referee));
            }

            return ServiceResult<IEnumerable<HealthCheckResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<HealthCheckResponse>>.Error(
                $"Error retrieving health check history: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<bool>> ApproveHorseForRaceAsync(Guid healthCheckId)
    {
        try
        {
            var healthCheck = await _healthCheckRepo.GetByIdAsync(healthCheckId);
            if (healthCheck == null)
            {
                return ServiceResult<bool>.Error("Health check not found", 404);
            }

            healthCheck.ApprovedToRace = true;
            healthCheck.Status = HealthCheckStatus.Passed;

            await _healthCheckRepo.UpdateAsync(healthCheck);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Error($"Error approving horse: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<bool>> RejectHorseForRaceAsync(Guid healthCheckId, string reason)
    {
        try
        {
            var healthCheck = await _healthCheckRepo.GetByIdAsync(healthCheckId);
            if (healthCheck == null)
            {
                return ServiceResult<bool>.Error("Health check not found", 404);
            }

            healthCheck.ApprovedToRace = false;
            healthCheck.Status = HealthCheckStatus.Failed;
            healthCheck.Verdict = reason;

            await _healthCheckRepo.UpdateAsync(healthCheck);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Error($"Error rejecting horse: {ex.Message}", 500);
        }
    }

    private HealthCheckResponse MapToResponse(HorseHealthCheck hc, Horse? horse, Race? race, Referee? referee)
    {
        return new HealthCheckResponse
        {
            Id = hc.Id,
            HorseId = hc.HorseId,
            HorseName = horse?.Name,
            RaceId = hc.RaceId,
            RaceName = race?.Name,
            RefereeId = hc.RefereeId,
            RefereeName = referee?.User?.FullName,
            Status = hc.Status.ToString(),
            CheckedAt = hc.CheckedAt,
            Observations = hc.Observations,
            Verdict = hc.Verdict,
            ApprovedToRace = hc.ApprovedToRace
        };
    }
}

public class ViolationRecordService : IViolationRecordService
{
    private readonly IViolationRecordRepository _violationRepo;
    private readonly IRaceRepository _raceRepo;
    private readonly IRaceEntryRepository _entryRepo;
    private readonly IRefereeRepository _refereeRepo;
    private readonly IUnitOfWork _unitOfWork;

    public ViolationRecordService(
        IViolationRecordRepository violationRepo,
        IRaceRepository raceRepo,
        IRaceEntryRepository entryRepo,
        IRefereeRepository refereeRepo,
        IUnitOfWork unitOfWork)
    {
        _violationRepo = violationRepo;
        _raceRepo = raceRepo;
        _entryRepo = entryRepo;
        _refereeRepo = refereeRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<ViolationResponse>> RecordViolationAsync(CreateViolationRequest request)
    {
        try
        {
            var violation = new ViolationRecord
            {
                Id = Guid.NewGuid(),
                RaceId = request.RaceId,
                RaceEntryId = request.RaceEntryId,
                RefereeId = request.RefereeId,
                ViolationType = Enum.Parse<ViolationType>(request.ViolationType),
                Description = request.Description,
                RecordedAt = DateTime.UtcNow,
                Evidence = request.Evidence,
                Penalty = request.Penalty
            };

            await _violationRepo.AddAsync(violation);
            await _unitOfWork.SaveChangesAsync();

            var race = await _raceRepo.GetByIdAsync(request.RaceId);
            var entry = await _entryRepo.GetByIdAsync(request.RaceEntryId);
            var referee = await _refereeRepo.GetByIdAsync(request.RefereeId);

            return ServiceResult<ViolationResponse>.Success(
                MapToResponse(violation, race, entry, referee), 201);
        }
        catch (Exception ex)
        {
            return ServiceResult<ViolationResponse>.Error($"Error recording violation: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<ViolationResponse>> GetViolationAsync(Guid id)
    {
        try
        {
            var violation = await _violationRepo.GetByIdAsync(id);
            if (violation == null)
            {
                return ServiceResult<ViolationResponse>.Error("Violation not found", 404);
            }

            var race = await _raceRepo.GetByIdAsync(violation.RaceId);
            var entry = await _entryRepo.GetByIdAsync(violation.RaceEntryId);
            var referee = await _refereeRepo.GetByIdAsync(violation.RefereeId);

            return ServiceResult<ViolationResponse>.Success(
                MapToResponse(violation, race, entry, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<ViolationResponse>.Error($"Error retrieving violation: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<IEnumerable<ViolationResponse>>> GetRaceViolationsAsync(Guid raceId)
    {
        try
        {
            var violations = await _violationRepo.GetByRaceAsync(raceId);
            var race = await _raceRepo.GetByIdAsync(raceId);

            var responses = new List<ViolationResponse>();
            foreach (var v in violations)
            {
                var entry = await _entryRepo.GetByIdAsync(v.RaceEntryId);
                var referee = await _refereeRepo.GetByIdAsync(v.RefereeId);
                responses.Add(MapToResponse(v, race, entry, referee));
            }

            return ServiceResult<IEnumerable<ViolationResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<ViolationResponse>>.Error(
                $"Error retrieving violations: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<IEnumerable<ViolationResponse>>> GetHorseViolationsAsync(Guid horseId)
    {
        try
        {
            var raceEntries = await _entryRepo.GetByHorseAsync(horseId);
            var allViolations = new List<ViolationRecord>();

            foreach (var entry in raceEntries)
            {
                var violations = await _violationRepo.GetByRaceEntryAsync(entry.Id);
                allViolations.AddRange(violations);
            }

            var responses = new List<ViolationResponse>();
            foreach (var v in allViolations)
            {
                var race = await _raceRepo.GetByIdAsync(v.RaceId);
                var entry = await _entryRepo.GetByIdAsync(v.RaceEntryId);
                var referee = await _refereeRepo.GetByIdAsync(v.RefereeId);
                responses.Add(MapToResponse(v, race, entry, referee));
            }

            return ServiceResult<IEnumerable<ViolationResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<ViolationResponse>>.Error(
                $"Error retrieving horse violations: {ex.Message}", 500);
        }
    }

    private ViolationResponse MapToResponse(ViolationRecord v, Race? race, RaceEntry? entry, Referee? referee)
    {
        return new ViolationResponse
        {
            Id = v.Id,
            RaceId = v.RaceId,
            RaceName = race?.Name,
            RaceEntryId = v.RaceEntryId,
            HorseName = entry?.Horse?.Name,
            RefereeId = v.RefereeId,
            RefereeName = referee?.User?.FullName,
            ViolationType = v.ViolationType.ToString(),
            Description = v.Description,
            RecordedAt = v.RecordedAt,
            Evidence = v.Evidence,
            Penalty = v.Penalty
        };
    }
}

public class RaceReportService : IRaceReportService
{
    private readonly IRaceReportRepository _reportRepo;
    private readonly IRaceRepository _raceRepo;
    private readonly IRefereeRepository _refereeRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RaceReportService(
        IRaceReportRepository reportRepo,
        IRaceRepository raceRepo,
        IRefereeRepository refereeRepo,
        IUnitOfWork unitOfWork)
    {
        _reportRepo = reportRepo;
        _raceRepo = raceRepo;
        _refereeRepo = refereeRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<RaceReportResponse>> CreateReportAsync(CreateRaceReportRequest request)
    {
        try
        {
            var report = new RaceReport
            {
                Id = Guid.NewGuid(),
                RaceId = request.RaceId,
                RefereeId = request.RefereeId,
                CompletedAt = DateTime.UtcNow,
                Details = request.Details,
                Incidents = request.Incidents,
                RecommendedActions = request.RecommendedActions,
                IsOfficialReport = false,
                CreatedAt = DateTime.UtcNow
            };

            await _reportRepo.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            var race = await _raceRepo.GetByIdAsync(request.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(request.RefereeId);

            return ServiceResult<RaceReportResponse>.Success(
                MapToResponse(report, race, referee), 201);
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceReportResponse>.Error($"Error creating report: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<RaceReportResponse>> GetReportAsync(Guid id)
    {
        try
        {
            var report = await _reportRepo.GetByIdAsync(id);
            if (report == null)
            {
                return ServiceResult<RaceReportResponse>.Error("Report not found", 404);
            }

            var race = await _raceRepo.GetByIdAsync(report.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(report.RefereeId);

            return ServiceResult<RaceReportResponse>.Success(
                MapToResponse(report, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceReportResponse>.Error($"Error retrieving report: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<RaceReportResponse>> GetRaceReportAsync(Guid raceId)
    {
        try
        {
            var report = await _reportRepo.GetByRaceAsync(raceId);
            if (report == null)
            {
                return ServiceResult<RaceReportResponse>.Error("Report not found", 404);
            }

            var race = await _raceRepo.GetByIdAsync(raceId);
            var referee = await _refereeRepo.GetByIdAsync(report.RefereeId);

            return ServiceResult<RaceReportResponse>.Success(
                MapToResponse(report, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceReportResponse>.Error($"Error retrieving race report: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<IEnumerable<RaceReportResponse>>> GetRefereeReportsAsync(Guid refereeId)
    {
        try
        {
            var reports = await _reportRepo.GetByRefereeAsync(refereeId);
            var referee = await _refereeRepo.GetByIdAsync(refereeId);

            var responses = new List<RaceReportResponse>();
            foreach (var r in reports)
            {
                var race = await _raceRepo.GetByIdAsync(r.RaceId);
                responses.Add(MapToResponse(r, race, referee));
            }

            return ServiceResult<IEnumerable<RaceReportResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RaceReportResponse>>.Error(
                $"Error retrieving reports: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<RaceReportResponse>> UpdateReportAsync(Guid id, CreateRaceReportRequest request)
    {
        try
        {
            var report = await _reportRepo.GetByIdAsync(id);
            if (report == null)
            {
                return ServiceResult<RaceReportResponse>.Error("Report not found", 404);
            }

            report.Details = request.Details;
            report.Incidents = request.Incidents;
            report.RecommendedActions = request.RecommendedActions;
            report.UpdatedAt = DateTime.UtcNow;

            await _reportRepo.UpdateAsync(report);
            await _unitOfWork.SaveChangesAsync();

            var race = await _raceRepo.GetByIdAsync(report.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(report.RefereeId);

            return ServiceResult<RaceReportResponse>.Success(
                MapToResponse(report, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceReportResponse>.Error($"Error updating report: {ex.Message}", 500);
        }
    }

    public async Task<ServiceResult<bool>> PublishReportAsync(Guid id)
    {
        try
        {
            var report = await _reportRepo.GetByIdAsync(id);
            if (report == null)
            {
                return ServiceResult<bool>.Error("Report not found", 404);
            }

            report.IsOfficialReport = true;
            report.UpdatedAt = DateTime.UtcNow;

            await _reportRepo.UpdateAsync(report);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Error($"Error publishing report: {ex.Message}", 500);
        }
    }

    private RaceReportResponse MapToResponse(RaceReport report, Race? race, Referee? referee)
    {
        return new RaceReportResponse
        {
            Id = report.Id,
            RaceId = report.RaceId,
            RaceName = race?.Name,
            RefereeId = report.RefereeId,
            RefereeName = referee?.User?.FullName,
            CompletedAt = report.CompletedAt,
            Details = report.Details,
            Incidents = report.Incidents,
            RecommendedActions = report.RecommendedActions,
            IsOfficialReport = report.IsOfficialReport,
            CreatedAt = report.CreatedAt,
            UpdatedAt = report.UpdatedAt
        };
    }
}
