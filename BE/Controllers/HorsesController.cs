using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Services.Interfaces;
using HorseRacing.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/horses")]
[Authorize(Roles = "HorseOwner")]
public class HorsesController : ControllerBase
{
    private readonly IHorseService _horseService;
    private readonly ICloudStorageService _cloudStorage;

    public HorsesController(IHorseService horseService, ICloudStorageService cloudStorage)
    {
        _horseService = horseService;
        _cloudStorage = cloudStorage;
    }

    [HttpGet("my-entries")]
    public async Task<ActionResult> GetMyRaceEntries()
    {
        var ownerId = GetUserId();
        var horses = await _horseService.GetMyHorsesAsync(ownerId);
        if (horses.StatusCode != 200) return StatusCode(horses.StatusCode, horses.Result);

        var list = (horses.Result.Data as System.Collections.IEnumerable)?.Cast<Horse>() ?? Enumerable.Empty<Horse>();
        var entries = list.SelectMany(h => (h.RaceEntries ?? new List<RaceEntry>()).Select(e => new
        {
            EntryId = e.Id,
            HorseId = h.Id,
            HorseName = h.Name,
            RaceId = e.RaceId,
            RaceName = e.Race?.Name ?? e.RaceId.ToString(),
            Status = e.Status.ToString(),
            OwnerConfirmed = e.OwnerConfirmed,
            JockeyConfirmed = e.JockeyConfirmed,
            GateNumber = e.GateNumber,
            FinishPosition = e.FinishPosition
        }));
        return Ok(entries);
    }

    [HttpGet]
    public async Task<ActionResult> GetMyHorses()
    {
        var ownerId = GetUserId();
        var result = await _horseService.GetMyHorsesAsync(ownerId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetHorse(Guid id)
    {
        var ownerId = GetUserId();
        var result = await _horseService.GetHorseAsync(ownerId, id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost]
    public async Task<ActionResult> CreateHorse(HorseCreateRequest request)
    {
        var ownerId = GetUserId();
        var result = await _horseService.CreateHorseAsync(ownerId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateHorse(Guid id, HorseUpdateRequest request)
    {
        var ownerId = GetUserId();
        var result = await _horseService.UpdateHorseAsync(ownerId, id, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteHorse(Guid id)
    {
        var ownerId = GetUserId();
        var result = await _horseService.DeleteHorseAsync(ownerId, id);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("{horseId:guid}/jockey-invitations")]
    public async Task<ActionResult> InviteJockey(Guid horseId, JockeyInvitationCreateRequest request)
    {
        var ownerId = GetUserId();
        var result = await _horseService.InviteJockeyAsync(ownerId, horseId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("{horseId:guid}/races/{raceId:guid}/registrations")]
    public async Task<ActionResult> RegisterHorse(Guid horseId, Guid raceId, RaceRegistrationRequest request)
    {
        var ownerId = GetUserId();
        var result = await _horseService.RegisterHorseAsync(ownerId, horseId, raceId, request);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("upload-image")]
    public async Task<ActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        try
        {
            var url = await _cloudStorage.UploadAsync(file, "horses");
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("races/{raceId:guid}/entries/{entryId:guid}/owner-confirm")]
    public async Task<ActionResult> ConfirmOwner(Guid raceId, Guid entryId)
    {
        var ownerId = GetUserId();
        var result = await _horseService.ConfirmOwnerAsync(ownerId, raceId, entryId);
        return StatusCode(result.StatusCode, result.Result);
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return value == null ? Guid.Empty : Guid.Parse(value);
    }
}