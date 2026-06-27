using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

public class PredictionService : IPredictionService
{
    private readonly IRaceRepository _races;
    private readonly IPredictionRepository _predictions;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWalletService _walletService;

    public PredictionService(IRaceRepository races, IPredictionRepository predictions, IUnitOfWork unitOfWork, IWalletService walletService)
    {
        _races = races;
        _predictions = predictions;
        _unitOfWork = unitOfWork;
        _walletService = walletService;
    }

    public async Task<ServiceResult<object>> CreatePredictionAsync(Guid userId, PredictionCreateRequest request)
    {
        var race = await _races.GetByIdWithEntriesAsync(request.RaceId);
        if (race == null)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Race not found.");
        }

        var horseInRace = race.Entries.Any(e => e.HorseId == request.PredictedHorseId);
        if (!horseInRace)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Horse is not registered for this race.");
        }

        var exists = await _predictions.ExistsAsync(request.RaceId, userId);
        if (exists)
        {
            return ServiceResult<object>.Fail(StatusCodes.Status409Conflict, "Prediction already exists for this race.");
        }

        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            RaceId = request.RaceId,
            PredictedHorseId = request.PredictedHorseId,
            SpectatorUserId = userId,
            Status = PredictionStatus.Pending,
            BetAmount = request.BetAmount,
            CreatedAt = DateTime.UtcNow
        };

        await _predictions.AddAsync(prediction);
        await _unitOfWork.SaveChangesAsync();

        // Deduct from wallet if bet amount > 0
        if (request.BetAmount > 0)
        {
            var deducted = await _walletService.DeductBetAsync(userId, request.BetAmount, prediction.Id);
            if (!deducted)
            {
                return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Insufficient wallet balance. Please deposit funds first.");
            }
        }

        return ServiceResult<object>.Ok(prediction);
    }

    public async Task<ServiceResult<object>> GetMyPredictionsAsync(Guid userId)
    {
        var predictions = await _predictions.GetByUserAsync(userId);
        var result = predictions.Select(p => new
        {
            p.Id,
            p.RaceId,
            RaceName = p.Race?.Name ?? p.RaceId.ToString(),
            PredictedHorseId = p.PredictedHorseId,
            PredictedHorseName = p.PredictedHorse?.Name ?? p.PredictedHorseId.ToString(),
            Status = p.Status.ToString(),
            p.BetAmount,
            p.Odds,
            p.PotentialPayout,
            p.PayoutAmount,
            p.CreatedAt,
            p.SettledAt
        });
        return ServiceResult<object>.Ok(result);
    }
}
