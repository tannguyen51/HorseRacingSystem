using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class TournamentService : ITournamentService
{
    private readonly ITournamentRepository _tournamentRepo;
    private readonly INotificationService _notificationService;
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;

    public TournamentService(ITournamentRepository tournamentRepo, INotificationService notificationService, IUserRepository userRepo, IUnitOfWork unitOfWork)
    {
        _tournamentRepo = tournamentRepo;
        _notificationService = notificationService;
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<TournamentResponse>> CreateTournamentAsync(CreateTournamentRequest request)
    {
        try
        {
            var tournament = new Tournament
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                ImageUrl = request.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _tournamentRepo.AddAsync(tournament);
            await _unitOfWork.SaveChangesAsync();

            // Notify all spectators about new tournament
            try
            {
                var users = await _userRepo.GetAllAsync();
                var spectators = users.Where(u => u.Role == UserRole.Spectator && u.IsActive).ToList();
                foreach (var s in spectators)
                {
                    try
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                        {
                            UserId = s.Id,
                            Title = "Giải đấu mới",
                            Message = $"Giải đấu \"{tournament.Name}\" vừa được tạo. Đặt cược ngay!",
                            Type = NotificationType.InApp,
                            Category = NotificationCategory.TournamentCreated,
                            ActionUrl = $"/tournaments/{tournament.Id}",
                            RelatedEntityId = tournament.Id,
                            RelatedEntityType = "Tournament"
                        });
                    }
                    catch { /* skip failed notification for individual user */ }
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail tournament creation
                System.Console.WriteLine($"Failed to send tournament notifications: {ex.Message}");
            }

            return new ServiceResult<TournamentResponse>(201, ApiResult<TournamentResponse>.Ok(new TournamentResponse
            {
                Id = tournament.Id,
                Name = tournament.Name,
                Description = tournament.Description,
                StartDate = tournament.StartDate,
                EndDate = tournament.EndDate,
                IsActive = tournament.IsActive,
                RoundCount = 0,
                RaceCount = 0,
                ImageUrl = tournament.ImageUrl,
                CreatedAt = tournament.CreatedAt
            }));
        }
        catch (Exception ex)
        {
            return ServiceResult<TournamentResponse>.Fail(500, $"Lỗi tạo giải đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<TournamentResponse>> GetTournamentAsync(Guid id)
    {
        try
        {
            var tournament = await _tournamentRepo.GetByIdAsync(id);
            if (tournament == null)
            {
                return ServiceResult<TournamentResponse>.Fail(404, "Không tìm thấy giải đấu");
            }

            return ServiceResult<TournamentResponse>.Ok(MapToResponse(tournament));
        }
        catch (Exception ex)
        {
            return ServiceResult<TournamentResponse>.Fail(500, $"Lỗi truy xuất giải đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<TournamentResponse>>> GetAllTournamentsAsync()
    {
        try
        {
            var tournaments = await _tournamentRepo.GetAllAsync();
            return ServiceResult<IEnumerable<TournamentResponse>>.Ok(
                tournaments.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<TournamentResponse>>.Fail(
                500, $"Lỗi truy xuất danh sách giải đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<TournamentResponse>>> GetActiveTournamentsAsync()
    {
        try
        {
            var tournaments = await _tournamentRepo.GetActiveAsync();
            return ServiceResult<IEnumerable<TournamentResponse>>.Ok(
                tournaments.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<TournamentResponse>>.Fail(
                500, $"Lỗi truy xuất giải đấu đang hoạt động: {ex.Message}");
        }
    }

    public async Task<ServiceResult<TournamentResponse>> UpdateTournamentAsync(Guid id, UpdateTournamentRequest request)
    {
        try
        {
            var tournament = await _tournamentRepo.GetByIdAsync(id);
            if (tournament == null)
            {
                return ServiceResult<TournamentResponse>.Fail(404, "Không tìm thấy giải đấu");
            }

            if (!string.IsNullOrEmpty(request.Name))
                tournament.Name = request.Name;
            if (request.Description != null)
                tournament.Description = request.Description;
            if (request.StartDate.HasValue)
                tournament.StartDate = request.StartDate.Value;
            if (request.EndDate.HasValue)
                tournament.EndDate = request.EndDate.Value;
            if (request.IsActive.HasValue)
                tournament.IsActive = request.IsActive.Value;
            if (request.ImageUrl != null)
                tournament.ImageUrl = request.ImageUrl;

            await _tournamentRepo.UpdateAsync(tournament);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<TournamentResponse>.Ok(MapToResponse(tournament));
        }
        catch (Exception ex)
        {
            return ServiceResult<TournamentResponse>.Fail(500, $"Lỗi cập nhật giải đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeleteTournamentAsync(Guid id)
    {
        try
        {
            await _tournamentRepo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi xóa giải đấu: {ex.Message}");
        }
    }

    private TournamentResponse MapToResponse(Tournament tournament)
    {
        return new TournamentResponse
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Description = tournament.Description,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            IsActive = tournament.IsActive,
            RoundCount = tournament.Rounds?.Count ?? 0,
            RaceCount = tournament.Races?.Count ?? 0,
            ImageUrl = tournament.ImageUrl,
            CreatedAt = tournament.CreatedAt,
            UpdatedAt = tournament.UpdatedAt
        };
    }
}

public class RoundService : IRoundService
{
    private readonly IRoundRepository _roundRepo;
    private readonly ITournamentRepository _tournamentRepo;
    private readonly IUnitOfWork _unitOfWork;

    public RoundService(IRoundRepository roundRepo, ITournamentRepository tournamentRepo, IUnitOfWork unitOfWork)
    {
        _roundRepo = roundRepo;
        _tournamentRepo = tournamentRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<RoundResponse>> CreateRoundAsync(CreateRoundRequest request)
    {
        try
        {
            var tournament = await _tournamentRepo.GetByIdAsync(request.TournamentId);
            if (tournament == null)
            {
                return ServiceResult<RoundResponse>.Fail(404, "Không tìm thấy giải đấu");
            }

            var round = new Round
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                TournamentId = request.TournamentId,
                RoundNumber = request.RoundNumber,
                ScheduledStartDate = request.ScheduledStartDate,
                ScheduledEndDate = request.ScheduledEndDate,
                Description = request.Description
            };

            await _roundRepo.AddAsync(round);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<RoundResponse>(201, ApiResult<RoundResponse>.Ok(MapToResponse(round)));
        }
        catch (Exception ex)
        {
            return ServiceResult<RoundResponse>.Fail(500, $"Lỗi tạo vòng đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RoundResponse>> GetRoundAsync(Guid id)
    {
        try
        {
            var round = await _roundRepo.GetByIdAsync(id);
            if (round == null)
            {
                return ServiceResult<RoundResponse>.Fail(404, "Không tìm thấy vòng đấu");
            }

            return ServiceResult<RoundResponse>.Ok(MapToResponse(round));
        }
        catch (Exception ex)
        {
            return ServiceResult<RoundResponse>.Fail(500, $"Lỗi truy xuất vòng đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RoundResponse>>> GetRoundsByTournamentAsync(Guid tournamentId)
    {
        try
        {
            var rounds = await _roundRepo.GetByTournamentAsync(tournamentId);
            return ServiceResult<IEnumerable<RoundResponse>>.Ok(
                rounds.Select(MapToResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RoundResponse>>.Fail(
                500, $"Lỗi truy xuất danh sách vòng đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RoundResponse>> UpdateRoundAsync(Guid id, UpdateRoundRequest request)
    {
        try
        {
            var round = await _roundRepo.GetByIdAsync(id);
            if (round == null)
            {
                return ServiceResult<RoundResponse>.Fail(404, "Không tìm thấy vòng đấu");
            }

            if (!string.IsNullOrEmpty(request.Name))
                round.Name = request.Name;
            if (request.RoundNumber.HasValue)
                round.RoundNumber = request.RoundNumber.Value;
            if (request.ScheduledStartDate.HasValue)
                round.ScheduledStartDate = request.ScheduledStartDate.Value;
            if (request.ScheduledEndDate.HasValue)
                round.ScheduledEndDate = request.ScheduledEndDate.Value;
            if (request.ActualStartDate.HasValue)
                round.ActualStartDate = request.ActualStartDate.Value;
            if (request.ActualEndDate.HasValue)
                round.ActualEndDate = request.ActualEndDate.Value;
            if (request.Description != null)
                round.Description = request.Description;

            await _roundRepo.UpdateAsync(round);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<RoundResponse>.Ok(MapToResponse(round));
        }
        catch (Exception ex)
        {
            return ServiceResult<RoundResponse>.Fail(500, $"Lỗi cập nhật vòng đấu: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeleteRoundAsync(Guid id)
    {
        try
        {
            await _roundRepo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi xóa vòng đấu: {ex.Message}");
        }
    }

    private RoundResponse MapToResponse(Round round)
    {
        return new RoundResponse
        {
            Id = round.Id,
            Name = round.Name,
            TournamentId = round.TournamentId,
            RoundNumber = round.RoundNumber,
            ScheduledStartDate = round.ScheduledStartDate,
            ScheduledEndDate = round.ScheduledEndDate,
            ActualStartDate = round.ActualStartDate,
            ActualEndDate = round.ActualEndDate,
            Description = round.Description,
            RaceCount = round.Races?.Count ?? 0
        };
    }
}
