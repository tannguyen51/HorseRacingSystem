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

public class AdminService : IAdminService
{
    private readonly PasswordHasher<User> _passwordHasher = new();
    private readonly IUserRepository _userRepo;
    private readonly IUserRegistrationRepository _registrationRepo;
    private readonly IHorseRepository _horseRepo;
    private readonly IJockeyRepository _jockeyRepo;
    private readonly IRefereeRepository _refereeRepo;
    private readonly IRaceRepository _raceRepo;
    private readonly ITournamentRepository _tournamentRepo;
    private readonly IRefereeService _refereeService;
    private readonly ILiveResultService _liveResultService;
    private readonly IPredictionService _predictionService;
    private readonly IUnitOfWork _unitOfWork;

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
        IPredictionService predictionService,
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
        _predictionService = predictionService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<AdminDashboardResponse>> GetDashboardAsync()
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            var referees = await _refereeRepo.GetAllAsync();
            var tournaments = await _tournamentRepo.GetActiveAsync();
            var races = await _raceRepo.GetAllAsync();
            var registrations = await _registrationRepo.GetPendingAsync();

            var response = new AdminDashboardResponse
            {
                TotalUsers = users.Count(),
                TotalReferees = referees.Count(),
                ActiveTournaments = tournaments.Count(),
                UpcomingRaces = races.Count(r => r.Status == RaceStatus.Scheduled),
                PendingRegistrations = registrations.Count(),
                OngoingRaces = races.Count(r => r.Status == RaceStatus.InProgress),
                ActiveRaces = races
                    .Where(r => r.Status == RaceStatus.InProgress || r.Status == RaceStatus.Scheduled)
                    .OrderBy(r => r.ScheduledAt)
                    .Take(5)
                    .Select(r => new ActiveRaceItem
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Status = r.Status.ToString(),
                        EntryCount = r.Entries?.Count ?? 0,
                        ScheduledAt = r.ScheduledAt
                    }).ToList(),
                RecentActivity = registrations
                    .OrderByDescending(r => r.SubmittedAt)
                    .Take(5)
                    .Select(r => new RecentActivityItem
                    {
                        Action = "Đăng ký mới",
                        Subject = r.FullName ?? r.Email,
                        CreatedAt = r.SubmittedAt
                    }).ToList()
            };

            return ServiceResult<AdminDashboardResponse>.Ok(response);
        }
        catch (Exception ex)
        {
            return ServiceResult<AdminDashboardResponse>.Fail(500, $"Error loading dashboard: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<UserManagementResponse>>> GetAllUsersAsync()
    {
        try
        {
            var users = await _userRepo.GetAllAsync();
            var response = users.Select(u => new UserManagementResponse
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role.ToString(),
                HorseCount = u.OwnerProfile?.Horses?.Count ?? 0,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            });

            return ServiceResult<IEnumerable<UserManagementResponse>>.Ok(response);
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<UserManagementResponse>>.Fail(500, $"Error retrieving users: {ex.Message}");
        }
    }

    public async Task<ServiceResult<UserManagementResponse>> GetUserAsync(Guid userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<UserManagementResponse>.Fail(404, "User not found");
            }

            var response = new UserManagementResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                HorseCount = user.OwnerProfile?.Horses?.Count ?? 0,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };

            return ServiceResult<UserManagementResponse>.Ok(response);
        }
        catch (Exception ex)
        {
            return ServiceResult<UserManagementResponse>.Fail(500, $"Error retrieving user: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeactivateUserAsync(Guid userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<bool>.Fail(404, "User not found");
            }

            user.IsActive = false;
            await _userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error deactivating user: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ReactivateUserAsync(Guid userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<bool>.Fail(404, "User not found");
            }

            user.IsActive = true;
            await _userRepo.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error reactivating user: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<AdminHorseResponse>>> GetOwnerHorsesAsync(Guid userId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<IEnumerable<AdminHorseResponse>>.Fail(404, "User not found");
            }

            if (user.Role != UserRole.HorseOwner)
            {
                return ServiceResult<IEnumerable<AdminHorseResponse>>.Fail(
                    400, "Only users with the HorseOwner role have horses.");
            }

            if (user.OwnerProfile == null)
            {
                return ServiceResult<IEnumerable<AdminHorseResponse>>.Fail(404, "Owner profile not found");
            }

            var horses = await _horseRepo.GetByOwnerAsync(user.OwnerProfile.Id);
            return ServiceResult<IEnumerable<AdminHorseResponse>>.Ok(
                horses.Select(horse => MapHorseResponse(horse, user)));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<AdminHorseResponse>>.Fail(
                500, $"Error retrieving owner horses: {ex.Message}");
        }
    }

    public async Task<ServiceResult<AdminHorseResponse>> GetOwnerHorseAsync(Guid userId, Guid horseId)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(404, "User not found");
            }

            if (user.Role != UserRole.HorseOwner)
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    400, "Only users with the HorseOwner role have horses.");
            }

            if (user.OwnerProfile == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(404, "Owner profile not found");
            }

            var horse = await _horseRepo.GetOwnedHorseAsync(horseId, user.OwnerProfile.Id);
            if (horse == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    404, "Horse not found for this owner.");
            }

            return ServiceResult<AdminHorseResponse>.Ok(MapHorseResponse(horse, user));
        }
        catch (Exception ex)
        {
            return ServiceResult<AdminHorseResponse>.Fail(
                500, $"Error retrieving horse detail: {ex.Message}");
        }
    }

    public async Task<ServiceResult<AdminHorseResponse>> UpdateOwnerHorseStatusAsync(
        Guid userId,
        Guid horseId,
        UpdateHorseApprovalStatusRequest request)
    {
        try
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(404, "User not found");
            }

            if (user.Role != UserRole.HorseOwner)
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    400, "Only users with the HorseOwner role have horses.");
            }

            if (user.OwnerProfile == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(404, "Owner profile not found");
            }

            if (!Enum.TryParse<ApprovalStatus>(request.Status, true, out var status) ||
                !Enum.IsDefined(status))
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    400, "Status must be Pending, Approved, or Rejected.");
            }

            if (status == ApprovalStatus.Rejected && string.IsNullOrWhiteSpace(request.Note))
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    400, "A rejection note is required when rejecting a horse.");
            }

            var horse = await _horseRepo.GetOwnedHorseAsync(horseId, user.OwnerProfile.Id);
            if (horse == null)
            {
                return ServiceResult<AdminHorseResponse>.Fail(
                    404, "Horse not found for this owner.");
            }

            horse.ApprovalStatus = status;
            horse.ApprovalNote = status == ApprovalStatus.Rejected
                ? request.Note!.Trim()
                : null;

            await _horseRepo.UpdateAsync(horse);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<AdminHorseResponse>.Ok(MapHorseResponse(horse, user));
        }
        catch (Exception ex)
        {
            return ServiceResult<AdminHorseResponse>.Fail(
                500, $"Error updating horse status: {ex.Message}");
        }
    }

    public async Task<ServiceResult<UserRegistrationResponse>> GetRegistrationAsync(Guid id)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(id);
            if (registration == null)
            {
                return ServiceResult<UserRegistrationResponse>.Fail(404, "Registration not found");
            }

            return ServiceResult<UserRegistrationResponse>.Ok(MapToResponse(registration));
        }
        catch (Exception ex)
        {
            return ServiceResult<UserRegistrationResponse>.Fail(500, $"Error retrieving registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetPendingRegistrationsAsync()
    {
        try
        {
            var registrations = await _registrationRepo.GetPendingAsync();
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500, $"Error retrieving pending registrations: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<UserRegistrationResponse>>> GetAllRegistrationsAsync()
    {
        try
        {
            var registrations = await _registrationRepo.GetAllAsync();
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Ok(
                registrations.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<UserRegistrationResponse>>.Fail(
                500, $"Error retrieving registrations: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ApproveRegistrationAsync(ApproveRegistrationRequest request)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            // Create new user
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = registration.Email,
                FullName = registration.FullName,
                PasswordHash = string.Empty,
                Role = registration.RequestedRole,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            newUser.PasswordHash = _passwordHasher.HashPassword(newUser, request.Password);

            await _userRepo.AddAsync(newUser);

            // Update registration
            registration.Status = RegistrationStatus.Approved;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.ApprovedUserId = newUser.Id;
            registration.AdminNotes = request.AdminNotes;

            await _registrationRepo.UpdateAsync(registration);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error approving registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RejectRegistrationAsync(RejectRegistrationRequest request)
    {
        try
        {
            var registration = await _registrationRepo.GetByIdAsync(request.RegistrationId);
            if (registration == null)
            {
                return ServiceResult<bool>.Fail(404, "Registration not found");
            }

            registration.Status = RegistrationStatus.Rejected;
            registration.ReviewedAt = DateTime.UtcNow;
            registration.RejectionReason = request.RejectionReason;
            registration.AdminNotes = request.AdminNotes;

            await _registrationRepo.UpdateAsync(registration);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error rejecting registration: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> ApproveJockeyAsync(Guid jockeyId)
    {
        try
        {
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }
            jockey.ApprovalStatus = ApprovalStatus.Approved;
            jockey.ApprovalNote = null;
            await _jockeyRepo.UpdateAsync(jockey);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error approving jockey: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RejectJockeyAsync(Guid jockeyId, string reason)
    {
        try
        {
            var jockey = await _jockeyRepo.GetByIdAsync(jockeyId);
            if (jockey == null)
            {
                return ServiceResult<bool>.Fail(404, "Jockey not found");
            }
            jockey.ApprovalStatus = ApprovalStatus.Rejected;
            jockey.ApprovalNote = reason;
            await _jockeyRepo.UpdateAsync(jockey);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Error rejecting jockey: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RefereeAssignmentResponse>> AssignRefereeToRaceAsync(AssignRefereeRequest request)
    {
        return await _refereeService.AssignRefereeToRaceAsync(request);
    }

    public async Task<ServiceResult<bool>> PublishRaceResultAsync(Guid raceId, RaceResultRequest request)
    {
        return await _liveResultService.UpdateRaceResultAsync(raceId, request);
    }

    public async Task<ServiceResult<bool>> SettlePredictionsAsync(Guid raceId, RaceResultRequest request)
    {
        try
        {
            await _predictionService.SettlePredictionAsync(raceId, request.WinningHorseId);
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi thanh toán: {ex.Message}");
        }
    }

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
            ReviewedByUserName = registration.ReviewedByUser?.FullName,
            RejectionReason = registration.RejectionReason,
            AdminNotes = registration.AdminNotes
        };
    }

    private static AdminHorseResponse MapHorseResponse(Horse horse, User ownerUser)
    {
        var activeJockeyInvitation = horse.JockeyInvitations
            .Where(invitation =>
                invitation.Status == JockeyInvitationStatus.Pending ||
                invitation.Status == JockeyInvitationStatus.Accepted)
            .OrderByDescending(invitation => invitation.CreatedAt)
            .FirstOrDefault();
        var raceAssignedJockey = horse.RaceEntries
            .Where(entry => entry.Jockey != null)
            .OrderByDescending(entry => entry.Race?.ScheduledAt ?? DateTime.MinValue)
            .Select(entry => entry.Jockey)
            .FirstOrDefault();
        var assignedJockey = activeJockeyInvitation?.Jockey ?? raceAssignedJockey;
        var assignedJockeyIds = horse.JockeyInvitations
            .Where(invitation =>
                invitation.Status == JockeyInvitationStatus.Pending ||
                invitation.Status == JockeyInvitationStatus.Accepted)
            .Select(invitation => invitation.JockeyId)
            .Concat(
                horse.RaceEntries
                    .Where(entry => entry.JockeyId.HasValue)
                    .Select(entry => entry.JockeyId!.Value))
            .Distinct()
            .ToArray();

        return new AdminHorseResponse
        {
            Id = horse.Id,
            Name = horse.Name,
            Breed = horse.Breed,
            Gender = horse.Gender,
            DateOfBirth = horse.DateOfBirth,
            Age = horse.Age,
            Weight = horse.Weight,
            Height = horse.Height,
            Color = horse.Color,
            ImageUrl = horse.ImageUrl,
            TotalRaces = horse.TotalRaces,
            TotalWins = horse.TotalWins,
            ApprovalStatus = horse.ApprovalStatus.ToString(),
            ApprovalNote = horse.ApprovalNote,
            OwnerId = horse.OwnerId,
            OwnerUserId = ownerUser.Id,
            OwnerName = ownerUser.FullName,
            AssignedJockeyId = assignedJockey?.Id,
            AssignedJockeyName = assignedJockey?.User?.FullName,
            JockeyAssignmentStatus = activeJockeyInvitation?.Status.ToString() ??
                (raceAssignedJockey != null ? "RaceAssigned" : null),
            AssignedJockeyIds = assignedJockeyIds
        };
    }
}
