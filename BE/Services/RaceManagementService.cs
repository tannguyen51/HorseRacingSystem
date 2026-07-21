using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;

namespace HorseRacing.Services;

public class RaceManagementService : IRaceManagementService
{
    private readonly IRaceRepository _raceRepo;
    private readonly IRaceEntryRepository _entryRepo;
    private readonly IHorseRepository _horseRepo;
    private readonly IJockeyRepository _jockeyRepo;
    private readonly ITournamentRepository _tournamentRepo;
    private readonly IRoundRepository _roundRepo;
    private readonly IPredictionRepository _predictionRepo;
    private readonly IWalletService _walletService;
    private readonly IUnitOfWork _unitOfWork;

    public RaceManagementService(
        IRaceRepository raceRepo,
        IRaceEntryRepository entryRepo,
        IHorseRepository horseRepo,
        IJockeyRepository jockeyRepo,
        ITournamentRepository tournamentRepo,
        IRoundRepository roundRepo,
        IPredictionRepository predictionRepo,
        IWalletService walletService,
        IUnitOfWork unitOfWork)
    {
        _raceRepo = raceRepo;
        _entryRepo = entryRepo;
        _horseRepo = horseRepo;
        _jockeyRepo = jockeyRepo;
        _tournamentRepo = tournamentRepo;
        _roundRepo = roundRepo;
        _predictionRepo = predictionRepo;
        _walletService = walletService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<RaceDetailResponse>> CreateRaceAsync(CreateRaceRequest request)
    {
        try
        {
            var tournament = await _tournamentRepo.GetByIdAsync(request.TournamentId);
            if (tournament == null)
            {
                return ServiceResult<RaceDetailResponse>.Error("Không tìm thấy giải đấu", 404);
            }

            var race = new Race
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                TournamentId = request.TournamentId,
                RoundId = request.RoundId,
                ScheduledAt = request.ScheduledAt,
                Status = RaceStatus.Scheduled,
                Location = request.Location,
                Description = request.Description,
                MaxParticipants = request.MaxParticipants,
                Distance = request.Distance,
                CreatedAt = DateTime.UtcNow
            };

            await _raceRepo.AddAsync(race);
            await _unitOfWork.SaveChangesAsync();

            return new ServiceResult<RaceDetailResponse>(201, ApiResult<RaceDetailResponse>.Ok(MapToDetailResponse(race)));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Lỗi tạo cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RaceDetailResponse>> GetRaceDetailsAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<RaceDetailResponse>.Fail(404, "Không tìm thấy cuộc đua");
            }

            return ServiceResult<RaceDetailResponse>.Ok(MapToDetailResponse(race));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Lỗi truy xuất cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<RaceDetailResponse>> UpdateRaceAsync(Guid raceId, UpdateRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<RaceDetailResponse>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (!string.IsNullOrEmpty(request.Name))
                race.Name = request.Name;
            if (request.ScheduledAt.HasValue)
                race.ScheduledAt = request.ScheduledAt.Value;
            if (!string.IsNullOrEmpty(request.Location))
                race.Location = request.Location;
            if (!string.IsNullOrEmpty(request.Description))
                race.Description = request.Description;
            if (request.MaxParticipants.HasValue)
                race.MaxParticipants = request.MaxParticipants.Value;
            if (request.Distance.HasValue)
                race.Distance = request.Distance.Value;

            race.UpdatedAt = DateTime.UtcNow;
            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();

            return ServiceResult<RaceDetailResponse>.Ok(MapToDetailResponse(race));
        }
        catch (Exception ex)
        {
            return ServiceResult<RaceDetailResponse>.Fail(500, $"Lỗi cập nhật cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RaceDetailResponse>>> GetRacesByTournamentAsync(Guid tournamentId)
    {
        try
        {
            var races = await _raceRepo.GetByTournamentAsync(tournamentId);
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Ok(
                races.Select(MapToDetailResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Fail(
                500, $"Lỗi truy xuất danh sách cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<IEnumerable<RaceDetailResponse>>> GetRacesByRoundAsync(Guid roundId)
    {
        try
        {
            var races = await _raceRepo.GetByRoundAsync(roundId);
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Ok(
                races.Select(MapToDetailResponse));
        }
        catch (Exception ex)
        {
            return ServiceResult<IEnumerable<RaceDetailResponse>>.Fail(
                500, $"Lỗi truy xuất danh sách cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> DeleteRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");

            if (race.Status != RaceStatus.Scheduled && race.Status != RaceStatus.Cancelled)
                return ServiceResult<bool>.Fail(400, $"Không thể xóa cuộc đua với trạng thái '{race.Status}'. Chỉ có thể xóa cuộc đua đã lên lịch hoặc đã hủy.");

            await _raceRepo.DeleteAsync(raceId);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi xóa cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> AssignHorseToRaceAsync(Guid raceId, AssignHorseToRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (race.Status != RaceStatus.Scheduled)
            {
                return ServiceResult<bool>.Fail(400, $"Không thể thêm ngựa vào cuộc đua có trạng thái '{race.Status}'. Cuộc đua phải ở trạng thái Đã lên lịch.");
            }

            var currentCount = await _entryRepo.GetByRaceAsync(raceId);
            if (currentCount.Count >= race.MaxParticipants)
            {
                return ServiceResult<bool>.Fail(400, $"Cuộc đua đã đạt số lượng người tham gia tối đa ({race.MaxParticipants}).");
            }

            var horse = await _horseRepo.GetByIdAsync(request.HorseId);
            if (horse == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy ngựa");
            }
            if (horse.ApprovalStatus != ApprovalStatus.Approved)
            {
                return ServiceResult<bool>.Fail(400, "Ngựa chưa được admin phê duyệt");
            }

            var alreadyInActiveRace = await _entryRepo.IsHorseInActiveRaceAsync(request.HorseId);
            if (alreadyInActiveRace)
            {
                var busyEntry = (await _entryRepo.GetByHorseAsync(request.HorseId))
                    .FirstOrDefault(e => e.Race != null && e.Race.Status != RaceStatus.Finished && e.Race.Status != RaceStatus.Cancelled);
                var busyRaceName = busyEntry?.Race?.Name ?? "cuộc đua khác";
                return ServiceResult<bool>.Fail(400, $"Ngựa này đã được đăng ký trong \"{busyRaceName}\". Không thể thêm vào nhiều cuộc đua cùng lúc.");
            }

            var existsInThisRace = await _entryRepo.ExistsAsync(raceId, request.HorseId);
            if (existsInThisRace)
            {
                return ServiceResult<bool>.Fail(400, "Ngựa đã được thêm vào cuộc đua này.");
            }

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

            if (assignedJockey != null &&
                request.JockeyId.HasValue &&
                request.JockeyId.Value != assignedJockey.Id)
            {
                return ServiceResult<bool>.Fail(
                    400,
                    $"Ngựa đã được phân công cho kỵ sĩ {assignedJockey.User?.FullName ?? assignedJockey.Id.ToString()}");
            }

            if (assignedJockey != null)
            {
                request.JockeyId = assignedJockey.Id;
            }

            if (request.JockeyId.HasValue)
            {
                var jockey = await _jockeyRepo.GetByIdAsync(request.JockeyId.Value);
                if (jockey == null)
                {
                    return ServiceResult<bool>.Fail(404, "Không tìm thấy kỵ sĩ");
                }
                if (jockey.ApprovalStatus != ApprovalStatus.Approved)
                {
                    return ServiceResult<bool>.Fail(400, "Kỵ sĩ chưa được admin phê duyệt");
                }
            }

            var entry = new RaceEntry
            {
                Id = Guid.NewGuid(),
                RaceId = raceId,
                HorseId = request.HorseId,
                JockeyId = request.JockeyId,
                Status = RegistrationStatus.Pending
            };

            await _entryRepo.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();

            await RecalculateOddsAsync(raceId);

            return new ServiceResult<bool>(201, ApiResult<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi phân công ngựa: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> BulkAssignHorsesToRaceAsync(Guid raceId, BulkAssignHorsesToRaceRequest request)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (race.Status != RaceStatus.Scheduled)
            {
                return ServiceResult<bool>.Fail(400, $"Không thể thêm ngựa vào cuộc đua có trạng thái '{race.Status}'. Cuộc đua phải ở trạng thái Đã lên lịch.");
            }

            var currentCount = await _entryRepo.GetByRaceAsync(raceId);
            if (currentCount.Count >= race.MaxParticipants)
            {
                return ServiceResult<bool>.Fail(400, $"Cuộc đua đã đạt số lượng người tham gia tối đa ({race.MaxParticipants}).");
            }

            var errors = new List<string>();
            var added = 0;
            foreach (var horseId in request.HorseIds)
            {
                if (added + currentCount.Count >= race.MaxParticipants)
                {
                    errors.Add($"Đã đạt số lượng tối đa ({race.MaxParticipants}), bỏ qua các ngựa còn lại.");
                    break;
                }
                var horse = await _horseRepo.GetByIdAsync(horseId);
                if (horse == null)
                {
                    errors.Add($"Không tìm thấy ngựa {horseId}");
                    continue;
                }
                if (horse.ApprovalStatus != ApprovalStatus.Approved)
                {
                    errors.Add($"Ngựa \"{horse.Name}\" chưa được phê duyệt");
                    continue;
                }

                var alreadyInActiveRace = await _entryRepo.IsHorseInActiveRaceAsync(horseId);
                if (alreadyInActiveRace)
                {
                    errors.Add($"Ngựa \"{horse.Name}\" đã đăng ký trong cuộc đua khác");
                    continue;
                }

                var existsInThisRace = await _entryRepo.ExistsAsync(raceId, horseId);
                if (existsInThisRace)
                {
                    errors.Add($"Ngựa \"{horse.Name}\" đã được thêm vào cuộc đua này");
                    continue;
                }

                var entry = new RaceEntry
                {
                    Id = Guid.NewGuid(),
                    RaceId = raceId,
                    HorseId = horseId,
                    Status = RegistrationStatus.Pending
                };
                await _entryRepo.AddAsync(entry);
                added++;
            }

            await _unitOfWork.SaveChangesAsync();
            await RecalculateOddsAsync(raceId);

            if (errors.Count > 0 && errors.Count == request.HorseIds.Length)
                return ServiceResult<bool>.Fail(400, $"Không thể thêm tất cả ngựa: {string.Join("; ", errors)}");

            if (errors.Count > 0)
                return new ServiceResult<bool>(207, ApiResult<bool>.Ok(true, $"Đã thêm với cảnh báo: {string.Join("; ", errors)}"));

            return new ServiceResult<bool>(201, ApiResult<bool>.Ok(true));
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi thêm hàng loạt ngựa: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> RemoveHorseFromRaceAsync(Guid raceId, Guid horseId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");

            if (race.Status != RaceStatus.Scheduled)
                return ServiceResult<bool>.Fail(400, "Không thể xóa ngựa sau khi cuộc đua đã bắt đầu.");

            var entry = await _entryRepo.GetByRaceAndHorseAsync(raceId, horseId);
            if (entry == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy đăng ký tham gia");
            }

            await _entryRepo.DeleteAsync(entry.Id);
            await _unitOfWork.SaveChangesAsync();
            await RecalculateOddsAsync(raceId);
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi xóa ngựa khỏi cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<List<Guid>>> GetBusyHorseIdsAsync()
    {
        try
        {
            var ids = await _entryRepo.GetHorseIdsInActiveRacesAsync();
            return ServiceResult<List<Guid>>.Ok(ids);
        }
        catch (Exception ex)
        {
            return ServiceResult<List<Guid>>.Fail(500, $"Lỗi lấy danh sách ngựa bận: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> StartRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (race.Status != RaceStatus.Scheduled)
            {
                return ServiceResult<bool>.Fail(400, $"Không thể bắt đầu cuộc đua với trạng thái '{race.Status}'. Cuộc đua phải ở trạng thái Đã lên lịch.");
            }

            var entries = await _entryRepo.GetByRaceAsync(raceId);
            if (entries.Count == 0)
            {
                return ServiceResult<bool>.Fail(400, "Không thể bắt đầu cuộc đua khi chưa có ngựa tham gia.");
            }

            race.Status = RaceStatus.InProgress;
            race.ActualStartTime = DateTime.UtcNow;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi bắt đầu cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> EndRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (race.Status != RaceStatus.InProgress)
            {
                return ServiceResult<bool>.Fail(400, $"Không thể kết thúc cuộc đua với trạng thái '{race.Status}'. Cuộc đua phải đang diễn ra.");
            }

            var entries = await _entryRepo.GetByRaceAsync(raceId);
            if (entries.Count == 0)
            {
                return ServiceResult<bool>.Fail(400, "Không thể kết thúc cuộc đua khi chưa có ngựa tham gia.");
            }

            race.Status = RaceStatus.AwaitingResult;
            race.ActualEndTime = DateTime.UtcNow;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi kết thúc cuộc đua: {ex.Message}");
        }
    }

    public async Task<ServiceResult<bool>> CancelRaceAsync(Guid raceId)
    {
        try
        {
            var race = await _raceRepo.GetByIdAsync(raceId);
            if (race == null)
            {
                return ServiceResult<bool>.Fail(404, "Không tìm thấy cuộc đua");
            }

            if (race.Status != RaceStatus.Scheduled && race.Status != RaceStatus.InProgress && race.Status != RaceStatus.AwaitingResult && race.Status != RaceStatus.ResultPendingApproval)
            {
                return ServiceResult<bool>.Fail(400, $"Không thể hủy cuộc đua với trạng thái '{race.Status}'.");
            }

            // Refund all pending predictions
            var pendingPredictions = await _predictionRepo.GetByRaceAsync(raceId);
            var refunded = 0;
            foreach (var p in pendingPredictions.Where(p => p.Status == PredictionStatus.Pending))
            {
                try
                {
                    await _walletService.AddPointsAsync(p.SpectatorUserId, p.BetAmount, $"refund_{raceId}");
                    p.Status = PredictionStatus.Lost; // Use Lost as "refunded/cancelled"
                    p.SettledAt = DateTime.UtcNow;
                    refunded++;
                }
                catch
                {
                    // If refund fails, keep prediction as Pending for manual resolution
                }
            }

            race.Status = RaceStatus.Cancelled;
            race.UpdatedAt = DateTime.UtcNow;

            await _raceRepo.UpdateAsync(race);
            await _unitOfWork.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }
        catch (Exception ex)
        {
            return ServiceResult<bool>.Fail(500, $"Lỗi hủy cuộc đua: {ex.Message}");
        }
    }

    private RaceDetailResponse MapToDetailResponse(Race race)
    {
        return new RaceDetailResponse
        {
            Id = race.Id,
            Name = race.Name,
            TournamentId = race.TournamentId,
            RoundId = race.RoundId,
            ScheduledAt = race.ScheduledAt,
            ActualStartTime = race.ActualStartTime,
            ActualEndTime = race.ActualEndTime,
            Status = race.Status.ToString(),
            Location = race.Location,
            Description = race.Description,
            MaxParticipants = race.MaxParticipants,
            Distance = race.Distance,
            EntriesCount = race.Entries?.Count ?? 0,
            ActiveRefereesCount = race.RefereeAssignments?.Count(a => a.Status != RefereeAssignmentStatus.Cancelled) ?? 0
        };
    }

    private async Task RecalculateOddsAsync(Guid raceId)
    {
        var entries = await _entryRepo.GetByRaceAsync(raceId);
        if (!entries.Any()) return;
        OddsCalculator.Recalculate(entries);
        await _unitOfWork.SaveChangesAsync();
    }
}
