using System;
using System.Threading.Tasks;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/races")]
public class RacesController : ControllerBase
{
    private readonly IRaceService _raceService;

    public RacesController(IRaceService raceService)
    {
        _raceService = raceService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaces()
    {
        var result = await _raceService.GetRacesAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRace(Guid id)
    {
        var result = await _raceService.GetRaceAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{id:guid}/result")]
    [AllowAnonymous]
    public async Task<ActionResult> GetRaceResult(Guid id)
    {
        var result = await _raceService.GetRaceResultAsync(id);
        return StatusCode(result.StatusCode, result.Result);
    }

}
