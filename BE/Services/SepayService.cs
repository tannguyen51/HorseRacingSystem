using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HorseRacing.Services;

public class SepayService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly IWalletRepository _walletRepo;
    private readonly IDepositRequestRepository _depositRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SepayService> _logger;

    public SepayService(
        HttpClient http,
        IConfiguration config,
        IWalletRepository walletRepo,
        IDepositRequestRepository depositRepo,
        IUnitOfWork unitOfWork,
        ILogger<SepayService> logger)
    {
        _http = http;
        _config = config;
        _walletRepo = walletRepo;
        _depositRepo = depositRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    private string ApiKey => _config["Sepay:ApiKey"] ?? "";
    private string ApiBaseUrl => _config["Sepay:ApiBaseUrl"] ?? "https://api.sepay.vn/v1";

    private HttpRequestMessage CreateRequest(HttpMethod method, string path)
    {
        var req = new HttpRequestMessage(method, $"{ApiBaseUrl}{path}");
        req.Headers.Add("Authorization", $"Bearer {ApiKey}");
        return req;
    }

    public async Task<SepayConfigResponse> GetConfigAsync()
    {
        var config = new SepayConfigResponse
        {
            BankId = _config["Sepay:BankId"] ?? "970422",
            AccountNumber = _config["Sepay:AccountNumber"] ?? "",
            AccountHolder = _config["Sepay:AccountHolder"] ?? "",
            Template = _config["Sepay:Template"] ?? "compact2"
        };

        // Try to fetch real bank info from Sepay API
        try
        {
            var req = CreateRequest(HttpMethod.Get, "/me");
            var res = await _http.SendAsync(req);
            if (res.IsSuccessStatusCode)
            {
                var data = await res.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
                if (data.TryGetProperty("bankAccounts", out var accounts) && accounts.GetArrayLength() > 0)
                {
                    var first = accounts[0];
                    config.BankId = first.TryGetProperty("bankId", out var bid) ? bid.GetString() ?? config.BankId : config.BankId;
                    config.AccountNumber = first.TryGetProperty("accountNumber", out var an) ? an.GetString() ?? config.AccountNumber : config.AccountNumber;
                    config.AccountHolder = first.TryGetProperty("accountHolder", out var ah) ? ah.GetString() ?? config.AccountHolder : config.AccountHolder;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch Sepay account info, using config fallback");
        }

        return config;
    }

    public async Task<List<SepayTransaction>> GetRecentTransactionsAsync(int limit = 50)
    {
        try
        {
            var req = CreateRequest(HttpMethod.Get, $"/transactions?limit={limit}");
            var res = await _http.SendAsync(req);
            if (res.IsSuccessStatusCode)
            {
                var body = await res.Content.ReadFromJsonAsync<SepayTransactionsResponse>();
                if (body?.Success == true && body.Transactions != null)
                    return body.Transactions;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Sepay transactions");
        }

        return new List<SepayTransaction>();
    }

    /// <summary>
    /// Sync: match pending deposit requests with Sepay transactions by amount.
    /// Auto-approve deposits where a matching Sepay transaction is found.
    /// </summary>
    public async Task<int> SyncDepositsAsync()
    {
        var pendingDeposits = await _depositRepo.GetPendingAsync();
        if (!pendingDeposits.Any())
            return 0;

        var sepayTransactions = await GetRecentTransactionsAsync(100);
        var matched = 0;

        foreach (var deposit in pendingDeposits)
        {
            // Match by amount (within 1 VND tolerance for rounding)
            var match = sepayTransactions.FirstOrDefault(t =>
                Math.Abs(t.TransferAmount - deposit.Amount) < 1 &&
                t.TransferType == "in" &&
                t.TransactionDate >= deposit.CreatedAt.AddMinutes(-5)
            );

            if (match != null)
            {
                deposit.Status = DepositStatus.Completed;
                deposit.ProcessedAt = DateTime.UtcNow;

                var wallet = await _walletRepo.GetByUserIdAsync(deposit.UserId);
                if (wallet == null)
                {
                    wallet = new Wallet { Id = Guid.NewGuid(), UserId = deposit.UserId };
                    await _walletRepo.AddAsync(wallet);
                    await _unitOfWork.SaveChangesAsync();
                }

                var balanceBefore = wallet.Balance;
                wallet.Balance += deposit.Amount;
                wallet.UpdatedAt = DateTime.UtcNow;

                await _walletRepo.AddTransactionAsync(new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    UserId = deposit.UserId,
                    Type = TransactionType.Deposit,
                    Amount = deposit.Amount,
                    BalanceBefore = balanceBefore,
                    BalanceAfter = wallet.Balance,
                    Description = $"Sepay auto-deposit | Ref: {match.ReferenceCode ?? match.Code} | Content: {match.Content}",
                    RelatedEntityId = deposit.Id
                });

                await _depositRepo.UpdateAsync(deposit);
                await _unitOfWork.SaveChangesAsync();
                matched++;
                _logger.LogInformation("Auto-approved deposit {DepositId} for user {UserId}, amount {Amount}, Sepay ref {Ref}",
                    deposit.Id, deposit.UserId, deposit.Amount, match.ReferenceCode ?? match.Code);
            }
        }

        return matched;
    }

    /// <summary>
    /// Process a Sepay webhook payload. Find matching pending deposit and approve it.
    /// </summary>
    public async Task<bool> ProcessWebhookAsync(SepayWebhookPayload payload)
    {
        if (payload.TransferType != "in" || payload.TransferAmount <= 0)
            return false;

        var pendingDeposits = await _depositRepo.GetPendingAsync();

        var match = pendingDeposits.FirstOrDefault(d =>
            Math.Abs(d.Amount - payload.TransferAmount) < 1 &&
            d.CreatedAt <= payload.TransactionDate.AddMinutes(5)
        );

        if (match == null)
        {
            _logger.LogInformation("Webhook: no matching pending deposit for Sepay tx {SepayId}, amount {Amount}",
                payload.Id, payload.TransferAmount);
            return false;
        }

        match.Status = DepositStatus.Completed;
        match.ProcessedAt = DateTime.UtcNow;

        var wallet = await _walletRepo.GetByUserIdAsync(match.UserId);
        if (wallet == null)
        {
            wallet = new Wallet { Id = Guid.NewGuid(), UserId = match.UserId };
            await _walletRepo.AddAsync(wallet);
            await _unitOfWork.SaveChangesAsync();
        }

        var balanceBefore = wallet.Balance;
        wallet.Balance += match.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        await _walletRepo.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            UserId = match.UserId,
            Type = TransactionType.Deposit,
            Amount = match.Amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = wallet.Balance,
            Description = $"Sepay webhook | Ref: {payload.ReferenceCode ?? payload.Code} | Content: {payload.Content}",
            RelatedEntityId = match.Id
        });

        await _depositRepo.UpdateAsync(match);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Webhook approved deposit {DepositId} for user {UserId}, amount {Amount}",
            match.Id, match.UserId, match.Amount);

        return true;
    }
}
