using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class RefereeService : IRefereeService
{
    private readonly IRefereeRepository _refereeRepo;
    private readonly IRefereeAssignmentRepository _assignmentRepo;
    private readonly IHealthCheckRepository _healthCheckRepo;
    private readonly IViolationRecordRepository _violationRepo;
    private readonly IRaceRepository _raceRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RefereeService(
        IRefereeRepository refereeRepo,
        IRefereeAssignmentRepository assignmentRepo,
        IHealthCheckRepository healthCheckRepo,
        IViolationRecordRepository violationRepo,
        IRaceRepository raceRepo,
        IUnitOfWork unitOfWork)
    {
        _refereeRepo = refereeRepo;
        _assignmentRepo = assignmentRepo;
        _healthCheckRepo = healthCheckRepo;
        _violationRepo = violationRepo;
        _raceRepo = raceRepo;
        _unitOfWork = unitOfWork;
    }

    // Referee Management
    public async Task<ServiceResult<RefereeResponse>> CreateRefereeAsync(CreateRefereeRequest request)
    {
        try
        {
            var referee = new Referee
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                LicenseNumber = request.LicenseNumber,
                Certifications = request.Certifications,
                LicenseExpiryDate = request.LicenseExpiryDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _refereeRepo.AddAsync(referee);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<RefereeResponse>(201, ApiResult<RefereeResponse>.Ok(MapToResponse(referee)));
        }
        catch (Exception ex)
        {
            return ServiceResult<RefereeResponse>.Fail(500, $"Error creating referee: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RefereeResponse>> GetRefereeAsync(Guid id)
    {
        try
        {
            var referee = await _refereeRepo.GetByIdAsync(id);
            if (referee == null)
            {
                return ServiceResult<RefereeResponse>.Fail(404, "Referee not found");
            }

            return ServiceResult<RefereeResponse>.Ok(MapToResponse(referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RefereeResponse>.Fail(500, $"Error retrieving referee: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RefereeResponse>>> GetAllRefereesAsync()
    {
        try
        {
            var referees = await _refereeRepo.GetAllAsync();
            return ServiceResult<IEnumerable<RefereeResponse>>.Ok(
                referees.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RefereeResponse>>.Fail(
                500, $"Error retrieving referees: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RefereeResponse>>> GetActiveRefereesAsync()
    {
        try
        {
            var referees = await _refereeRepo.GetActiveAsync();
            return ServiceResult<IEnumerable<RefereeResponse>>.Ok(
                referees.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RefereeResponse>>.Fail(
                500, $"Error retrieving active referees: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RefereeResponse>> UpdateRefereeAsync(Guid id, UpdateRefereeRequest request)
    {
        try
        {
            var referee = await _refereeRepo.GetByIdAsync(id);
            if (referee == null)
            {
                return ServiceResult<RefereeResponse>.Fail(404, "Referee not found");
            }

            if (!string.IsNullOrEmpty(request.LicenseNumber))
                referee.LicenseNumber = request.LicenseNumber;
            if (!string.IsNullOrEmpty(request.Certifications))
                referee.Certifications = request.Certifications;
            if (request.LicenseExpiryDate.HasValue)
                referee.LicenseExpiryDate = request.LicenseExpiryDate.Value;
            if (request.IsActive.HasValue)
                referee.IsActive = request.IsActive.Value;

            referee.UpdatedAt = DateTime.UtcNow;
            await _refereeRepo.UpdateAsync(referee);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<RefereeResponse>.Ok(MapToResponse(referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RefereeResponse>.Fail(500, $"Error updating referee: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeleteRefereeAsync(Guid id)
    {
        try
        {
            await _refereeRepo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error deleting referee: {ex.Message}");
        }
    }

    // Referee Assignment
    public async Task<ServiceResult<RefereeAssignmentResponse>> AssignRefereeToRaceAsync(AssignRefereeRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(request.RaceId);
            if (race == null)
            {
                return ServiceResult<RefereeAssignmentResponse>.Fail(404, "Race not found");
            }

            var referee = await _refereeRepo.GetByIdAsync(request.RefereeId);
            if (referee == null)
            {
                return ServiceResult<RefereeAssignmentResponse>.Fail(404, "Referee not found");
            }

            var assignment = new RefereeAssignment
            {
                Id = Guid.NewGuid(),
                RaceId = request.RaceId,
                RefereeId = request.RefereeId,
                Role = request.Role,
                Status = RefereeAssignmentStatus.Assigned,
                AssignedAt = DateTime.UtcNow,
                Notes = request.Notes
            };

            await _assignmentRepo.AddAsync(assignment);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<RefereeAssignmentResponse>(201, ApiResult<RefereeAssignmentResponse>.Ok(MapToAssignmentResponse(assignment, race, referee)));
        }
        catch (Exception ex)
        {
            return ServiceResult<RefereeAssignmentResponse>.Fail(500, $"Error assigning referee: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RefereeAssignmentResponse>>> GetRaceAssignmentsAsync(Guid raceId)
    {
        try
        {
            var assignments = await _assignmentRepo.GetByRaceAsync(raceId);
            var race = await _raceRepo.GetByIdAsync(raceId);

            var responses = new List<RefereeAssignmentResponse>();
            foreach (var assignment in assignments)
            {
                var referee = await _refereeRepo.GetByIdAsync(assignment.RefereeId);
                responses.Add(MapToAssignmentResponse(assignment, race, referee));
            }

            return ServiceResult<IEnumerable<RefereeAssignmentResponse>>.Success(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RefereeAssignmentResponse>>.Fail(
                500, $"Error retrieving assignments: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RefereeAssignmentResponse>>> GetRefereeAssignmentsAsync(Guid refereeId)
    {
        try
        {
            var assignments = await _assignmentRepo.GetByRefereeAsync(refereeId);
            var referee = await _refereeRepo.GetByIdAsync(refereeId);

            var responses = new List<RefereeAssignmentResponse>();
            foreach (var assignment in assignments)
            {
                var race = await _raceRepo.GetByIdAsync(assignment.RaceId);
                responses.Add(MapToAssignmentResponse(assignment, race, referee));
            }

            return ServiceResult<IEnumerable<RefereeAssignmentResponse>>.Ok(responses);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RefereeAssignmentResponse>>.Fail(
                500, $"Error retrieving assignments: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RefereeAssignmentResponse>> ConfirmAssignmentAsync(ConfirmRefereeAssignmentRequest request)
    {
        try
        {
            var assignment = await _assignmentRepo.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
            {
                return ServiceResult<RefereeAssignmentResponse>.Fail(404, "Assignment not found");
            }

            assignment.Status = RefereeAssignmentStatus.Confirmed;
            assignment.ConfirmedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(request.Notes))
                assignment.Notes = request.Notes;

            await _assignmentRepo.UpdateAsync(assignment);
            await _unitOfWork.SaveChangesAsync();

            var race = await _raceRepo.GetByIdAsync(assignment.RaceId);
            var referee = await _refereeRepo.GetByIdAsync(assignment.RefereeId);

            return ServiceResult<RefereeAssignmentResponse>.Ok(MapToAssignmentResponse(assignment, race, referee));
        }
        catch (Exception ex)
        {
            return ServiceResult<RefereeAssignmentResponse>.Fail(500, $"Error confirming assignment: {ex.Message}");
        }
    }

    private RefereeResponse MapToResponse(Referee referee)
    {
        return new RefereeResponse
        {
            Id = referee.Id,
            UserId = referee.UserId,
            UserFullName = referee.User?.FullName,
            LicenseNumber = referee.LicenseNumber,
            Certifications = referee.Certifications,
            LicenseExpiryDate = referee.LicenseExpiryDate,
            IsActive = referee.IsActive,
            TotalAssignments = referee.Assignments?.Count ?? 0,
            CreatedAt = referee.CreatedAt,
            UpdatedAt = referee.UpdatedAt
        };
    }

    private RefereeAssignmentResponse MapToAssignmentResponse(RefereeAssignment assignment, Race? race, Referee? referee)
    {
        return new RefereeAssignmentResponse
        {
            Id = assignment.Id,
            RaceId = assignment.RaceId,
            RaceName = race?.Name,
            RefereeId = assignment.RefereeId,
            RefereeName = referee?.User?.FullName,
            Role = assignment.Role,
            Status = assignment.Status.ToString(),
            AssignedAt = assignment.AssignedAt,
            ConfirmedAt = assignment.ConfirmedAt,
            CompletedAt = assignment.CompletedAt,
            Notes = assignment.Notes
        };
    }
}
