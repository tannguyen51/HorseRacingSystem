using System;
using System.Security.Claims;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Services;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HorseRacing.Controllers;

[ApiController]
[Route("api/wallet")]
[Authorize(Roles = "Spectator")]
public class WalletController : ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet]
    public async Task<ActionResult> GetWallet()
    {
        var userId = GetUserId();
        var result = await _walletService.GetWalletAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("sepay-config")]
    public async Task<ActionResult> GetSepayConfig()
    {
        var result = await _walletService.GetSepayConfigAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("deposit")]
    public async Task<ActionResult> CreateDeposit(DepositRequestDto dto)
    {
        var userId = GetUserId();
        var result = await _walletService.CreateDepositRequestAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("bank-account")]
    public async Task<ActionResult> RegisterBankAccount(BankAccountDto dto)
    {
        var userId = GetUserId();
        var result = await _walletService.RegisterBankAccountAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("withdraw")]
    public async Task<ActionResult> CreateWithdrawal(WithdrawRequestDto dto)
    {
        var userId = GetUserId();
        var result = await _walletService.CreateWithdrawalRequestAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("transactions")]
    public async Task<ActionResult> GetTransactions()
    {
        var userId = GetUserId();
        var result = await _walletService.GetTransactionsAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("deposits")]
    public async Task<ActionResult> GetDepositRequests()
    {
        var userId = GetUserId();
        var result = await _walletService.GetDepositRequestsAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("withdrawals")]
    public async Task<ActionResult> GetWithdrawalRequests()
    {
        var userId = GetUserId();
        var result = await _walletService.GetWithdrawalRequestsAsync(userId);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Admin endpoints
    [HttpGet("admin/pending-deposits")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminGetPendingDeposits()
    {
        var result = await _walletService.AdminGetPendingDepositsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("admin/deposits/{depositId}/process")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminProcessDeposit(Guid depositId, ProcessDepositDto dto)
    {
        var adminId = GetUserId();
        var result = await _walletService.AdminProcessDepositAsync(depositId, dto, adminId);
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("admin/pending-withdrawals")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminGetPendingWithdrawals()
    {
        var result = await _walletService.AdminGetPendingWithdrawalsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpGet("admin/withdrawals")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminGetAllWithdrawals()
    {
        var result = await _walletService.AdminGetAllWithdrawalsAsync();
        return StatusCode(result.StatusCode, result.Result);
    }

    [HttpPost("admin/withdrawals/{withdrawalId}/process")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> AdminProcessWithdrawal(Guid withdrawalId, ProcessWithdrawalDto dto)
    {
        var adminId = GetUserId();
        var result = await _walletService.AdminProcessWithdrawalAsync(withdrawalId, dto, adminId);
        return StatusCode(result.StatusCode, result.Result);
    }

    // Sepay webhook - called by Sepay when a transaction occurs
    [HttpPost("webhook/sepay")]
    [AllowAnonymous]
    public async Task<ActionResult> SepayWebhook([FromBody] SepayWebhookPayload payload, [FromServices] SepayService sepayService)
    {
        var ok = await sepayService.ProcessWebhookAsync(payload);
        return Ok(new { success = ok });
    }

    // Admin: manually trigger sync with Sepay
    [HttpPost("admin/sync-sepay")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> SyncSepay([FromServices] SepayService sepayService)
    {
        var matched = await sepayService.SyncDepositsAsync();
        return Ok(new { success = true, matched });
    }

    private Guid GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return value == null ? Guid.Empty : Guid.Parse(value);
    }
}
