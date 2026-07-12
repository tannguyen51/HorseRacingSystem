using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/referees")]
public class RaceReportsController : ControllerBase
{
    private readonly IRaceReportService _service;
    public RaceReportsController(IRaceReportService service) => _service = service;

    [HttpPost("reports")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> Create([FromBody] CreateRaceReportRequest r)
        => OkR(await _service.CreateReportAsync(r));

    [HttpGet("reports/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> Get(Guid id)
        => OkR(await _service.GetReportAsync(id));

    [HttpGet("race/{raceId:guid}/report")]
    [AllowAnonymous]
    public async Task<ActionResult> GetByRace(Guid raceId)
        => OkR(await _service.GetRaceReportAsync(raceId));

    [HttpGet("{refereeId:guid}/reports")]
    [Authorize(Roles = "Referee,Admin")]
    public async Task<ActionResult> GetByReferee(Guid refereeId)
        => OkR(await _service.GetRefereeReportsAsync(refereeId));

    [HttpPut("reports/{id:guid}")]
    [Authorize(Roles = "Referee")]
    public async Task<ActionResult> Update(Guid id, [FromBody] CreateRaceReportRequest r)
        => OkR(await _service.UpdateReportAsync(id, r));

    [HttpPost("reports/{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Publish(Guid id)
        => OkR(await _service.PublishReportAsync(id));

    private ActionResult OkR<T>(ServiceResult<T> r) => StatusCode(r.StatusCode, r.Result);
}
