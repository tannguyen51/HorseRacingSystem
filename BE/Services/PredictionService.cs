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

    public PredictionService(IRaceRepository races, IPredictionRepository predictions, IUnitOfWork unitOfWork)
    {
        _races = races;
        _predictions = predictions;
        _unitOfWork = unitOfWork;
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
            CreatedAt = DateTime.UtcNow
        };

        await _predictions.AddAsync(prediction);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(prediction);
    }

    public async Task<ServiceResult<object>> GetMyPredictionsAsync(Guid userId)
    {
        var predictions = await _predictions.GetByUserAsync(userId);
        return ServiceResult<object>.Ok(predictions);
    }
}
