using System;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace HorseRacing.Services;

public class WalletService : IWalletService
{
    private readonly IWalletRepository _walletRepo;
    private readonly IBankAccountRepository _bankAccountRepo;
    private readonly IWithdrawalRequestRepository _withdrawalRepo;
    private readonly IDepositRequestRepository _depositRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly SepayService _sepayService;

    public WalletService(
        IWalletRepository walletRepo,
        IBankAccountRepository bankAccountRepo,
        IWithdrawalRequestRepository withdrawalRepo,
        IDepositRequestRepository depositRepo,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        SepayService sepayService)
    {
        _walletRepo = walletRepo;
        _bankAccountRepo = bankAccountRepo;
        _withdrawalRepo = withdrawalRepo;
        _depositRepo = depositRepo;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _sepayService = sepayService;
    }

    private async Task<Wallet> EnsureWalletAsync(Guid userId)
    {
        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        if (wallet == null)
        {
            wallet = new Wallet { Id = Guid.NewGuid(), UserId = userId };
            await _walletRepo.AddAsync(wallet);
            await _unitOfWork.SaveChangesAsync();
        }
        return wallet;
    }

    public async Task<ServiceResult<WalletResponse>> GetWalletAsync(Guid userId)
    {
        var wallet = await EnsureWalletAsync(userId);
        var bankAccount = await _bankAccountRepo.GetByUserIdAsync(userId);

        return ServiceResult<WalletResponse>.Ok(new WalletResponse
        {
            Id = wallet.Id,
            Balance = wallet.Balance,
            HasBankAccount = bankAccount != null,
            BankAccount = bankAccount == null ? null : new BankAccountInfo
            {
                Id = bankAccount.Id,
                BankName = bankAccount.BankName,
                AccountNumber = bankAccount.AccountNumber,
                AccountHolder = bankAccount.AccountHolder
            }
        });
    }

    public async Task<ServiceResult<WalletResponse>> CreateDepositRequestAsync(Guid userId, DepositRequestDto dto)
    {
        var deposit = new DepositRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = dto.Amount,
            Status = DepositStatus.Pending
        };

        await _depositRepo.AddAsync(deposit);
        await _unitOfWork.SaveChangesAsync();

        return await GetWalletAsync(userId);
    }

    public async Task<ServiceResult<WalletResponse>> RegisterBankAccountAsync(Guid userId, BankAccountDto dto)
    {
        var existing = await _bankAccountRepo.GetByUserIdAsync(userId);
        if (existing != null)
        {
            return ServiceResult<WalletResponse>.Fail(StatusCodes.Status409Conflict, "Bank account already registered.");
        }

        var bankAccount = new BankAccount
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BankName = dto.BankName,
            AccountNumber = dto.AccountNumber,
            AccountHolder = dto.AccountHolder
        };

        await _bankAccountRepo.AddAsync(bankAccount);
        await _unitOfWork.SaveChangesAsync();

        return await GetWalletAsync(userId);
    }

    public async Task<ServiceResult<WalletResponse>> CreateWithdrawalRequestAsync(Guid userId, WithdrawRequestDto dto)
    {
        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        if (wallet == null || wallet.Balance < dto.Amount)
        {
            return ServiceResult<WalletResponse>.Fail(StatusCodes.Status400BadRequest, "Insufficient balance.");
        }

        var bankAccount = await _bankAccountRepo.GetByUserIdAsync(userId);
        if (bankAccount == null)
        {
            return ServiceResult<WalletResponse>.Fail(StatusCodes.Status400BadRequest, "Bank account not registered. Please register your bank account first.");
        }

        // Debit wallet immediately
        wallet.Balance -= dto.Amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        var withdrawal = new WithdrawalRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BankAccountId = bankAccount.Id,
            Amount = dto.Amount,
            Status = WithdrawalStatus.Pending
        };

        await _withdrawalRepo.AddAsync(withdrawal);

        await _walletRepo.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = TransactionType.Withdraw,
            Amount = dto.Amount,
            BalanceBefore = wallet.Balance + dto.Amount,
            BalanceAfter = wallet.Balance,
            Description = $"Withdrawal request #{withdrawal.Id.ToString()[..8]}",
            RelatedEntityId = withdrawal.Id
        });

        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<WalletResponse>.Ok(new WalletResponse
        {
            Id = wallet.Id,
            Balance = wallet.Balance,
            HasBankAccount = true,
            BankAccount = new BankAccountInfo
            {
                Id = bankAccount.Id,
                BankName = bankAccount.BankName,
                AccountNumber = bankAccount.AccountNumber,
                AccountHolder = bankAccount.AccountHolder
            }
        });
    }

    public async Task<ServiceResult<object>> GetTransactionsAsync(Guid userId)
    {
        var transactions = await _walletRepo.GetTransactionsByUserIdAsync(userId);
        var result = transactions.Select(t => new TransactionResponse
        {
            Id = t.Id,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            BalanceBefore = t.BalanceBefore,
            BalanceAfter = t.BalanceAfter,
            Description = t.Description,
            CreatedAt = t.CreatedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    public async Task<ServiceResult<object>> GetDepositRequestsAsync(Guid userId)
    {
        var deposits = await _depositRepo.GetByUserIdAsync(userId);
        var result = deposits.Select(d => new DepositRequestResponse
        {
            Id = d.Id,
            Amount = d.Amount,
            Status = d.Status.ToString(),
            CreatedAt = d.CreatedAt,
            ProcessedAt = d.ProcessedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    public async Task<ServiceResult<object>> GetWithdrawalRequestsAsync(Guid userId)
    {
        var withdrawals = await _withdrawalRepo.GetByUserIdAsync(userId);
        var result = withdrawals.Select(w => new WithdrawalRequestResponse
        {
            Id = w.Id,
            Amount = w.Amount,
            Status = w.Status.ToString(),
            BankAccount = w.BankAccount == null ? null : new BankAccountInfo
            {
                Id = w.BankAccount.Id,
                BankName = w.BankAccount.BankName,
                AccountNumber = w.BankAccount.AccountNumber,
                AccountHolder = w.BankAccount.AccountHolder
            },
            AdminNote = w.AdminNote,
            CreatedAt = w.CreatedAt,
            ProcessedAt = w.ProcessedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    public async Task<ServiceResult<SepayConfigResponse>> GetSepayConfigAsync()
    {
        var config = await _sepayService.GetConfigAsync();
        return ServiceResult<SepayConfigResponse>.Ok(config);
    }

    // Admin: pending deposits
    public async Task<ServiceResult<object>> AdminGetPendingDepositsAsync()
    {
        var deposits = await _depositRepo.GetPendingAsync();
        var result = deposits.Select(d => new AdminDepositResponse
        {
            Id = d.Id,
            UserId = d.UserId,
            UserEmail = d.User?.Email ?? "",
            UserName = d.User?.FullName ?? "",
            Amount = d.Amount,
            Status = d.Status.ToString(),
            CreatedAt = d.CreatedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    // Admin: approve/reject deposit
    public async Task<ServiceResult<object>> AdminProcessDepositAsync(Guid depositId, ProcessDepositDto dto, Guid adminId)
    {
        var deposit = await _depositRepo.GetByIdAsync(depositId);
        if (deposit == null)
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Deposit request not found.");

        if (deposit.Status != DepositStatus.Pending)
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Deposit already processed.");

        if (dto.Approved)
        {
            deposit.Status = DepositStatus.Completed;
            deposit.ProcessedAt = DateTime.UtcNow;
            deposit.ProcessedByAdminId = adminId;

            var wallet = await EnsureWalletAsync(deposit.UserId);
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
                Description = $"Deposit approved #{deposit.Id.ToString()[..8]}",
                RelatedEntityId = deposit.Id
            });
        }
        else
        {
            deposit.Status = DepositStatus.Cancelled;
            deposit.ProcessedAt = DateTime.UtcNow;
            deposit.ProcessedByAdminId = adminId;
        }

        await _depositRepo.UpdateAsync(deposit);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { deposit.Id, deposit.Status });
    }

    // Admin: pending withdrawals
    public async Task<ServiceResult<object>> AdminGetPendingWithdrawalsAsync()
    {
        var withdrawals = await _withdrawalRepo.GetPendingAsync();
        var result = withdrawals.Select(w => new AdminWithdrawalResponse
        {
            Id = w.Id,
            UserId = w.UserId,
            UserEmail = w.User?.Email ?? "",
            UserName = w.User?.FullName ?? "",
            Amount = w.Amount,
            Status = w.Status.ToString(),
            BankAccount = w.BankAccount == null ? null : new BankAccountInfo
            {
                Id = w.BankAccount.Id,
                BankName = w.BankAccount.BankName,
                AccountNumber = w.BankAccount.AccountNumber,
                AccountHolder = w.BankAccount.AccountHolder
            },
            CreatedAt = w.CreatedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    public async Task<ServiceResult<object>> AdminGetAllWithdrawalsAsync()
    {
        var withdrawals = await _withdrawalRepo.GetAllAsync();
        var result = withdrawals.Select(w => new AdminWithdrawalResponse
        {
            Id = w.Id,
            UserId = w.UserId,
            UserEmail = w.User?.Email ?? "",
            UserName = w.User?.FullName ?? "",
            Amount = w.Amount,
            Status = w.Status.ToString(),
            BankAccount = w.BankAccount == null ? null : new BankAccountInfo
            {
                Id = w.BankAccount.Id,
                BankName = w.BankAccount.BankName,
                AccountNumber = w.BankAccount.AccountNumber,
                AccountHolder = w.BankAccount.AccountHolder
            },
            AdminNote = w.AdminNote,
            CreatedAt = w.CreatedAt,
            ProcessedAt = w.ProcessedAt
        });
        return ServiceResult<object>.Ok(result);
    }

    // Admin: process withdrawal (mark as completed/rejected)
    public async Task<ServiceResult<object>> AdminProcessWithdrawalAsync(Guid withdrawalId, ProcessWithdrawalDto dto, Guid adminId)
    {
        var withdrawal = await _withdrawalRepo.GetByIdAsync(withdrawalId);
        if (withdrawal == null)
            return ServiceResult<object>.Fail(StatusCodes.Status404NotFound, "Withdrawal request not found.");

        if (withdrawal.Status != WithdrawalStatus.Pending)
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Withdrawal already processed.");

        if (dto.Approved)
        {
            withdrawal.Status = WithdrawalStatus.Completed;
            withdrawal.AdminNote = dto.AdminNote;
            withdrawal.ProcessedAt = DateTime.UtcNow;
            withdrawal.ProcessedByAdminId = adminId;
        }
        else
        {
            // Reject: refund wallet
            withdrawal.Status = WithdrawalStatus.Rejected;
            withdrawal.AdminNote = dto.AdminNote;
            withdrawal.ProcessedAt = DateTime.UtcNow;
            withdrawal.ProcessedByAdminId = adminId;

            var wallet = await _walletRepo.GetByUserIdAsync(withdrawal.UserId);
            if (wallet != null)
            {
                var balanceBefore = wallet.Balance;
                wallet.Balance += withdrawal.Amount;
                wallet.UpdatedAt = DateTime.UtcNow;

                await _walletRepo.AddTransactionAsync(new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    UserId = withdrawal.UserId,
                    Type = TransactionType.Refund,
                    Amount = withdrawal.Amount,
                    BalanceBefore = balanceBefore,
                    BalanceAfter = wallet.Balance,
                    Description = $"Withdrawal rejected, refund #{withdrawal.Id.ToString()[..8]}",
                    RelatedEntityId = withdrawal.Id
                });
            }
        }

        await _withdrawalRepo.UpdateAsync(withdrawal);
        await _unitOfWork.SaveChangesAsync();

        return ServiceResult<object>.Ok(new { withdrawal.Id, withdrawal.Status });
    }

    // Deduct for betting
    public async Task<bool> DeductBetAsync(Guid userId, decimal amount, Guid predictionId)
    {
        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        if (wallet == null || wallet.Balance < amount)
            return false;

        var balanceBefore = wallet.Balance;
        wallet.Balance -= amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        await _walletRepo.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = TransactionType.Bet,
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = wallet.Balance,
            Description = $"Bet on prediction #{predictionId.ToString()[..8]}",
            RelatedEntityId = predictionId
        });

        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    // Credit for winning
    public async Task<bool> CreditWinAsync(Guid userId, decimal amount, Guid predictionId)
    {
        var wallet = await EnsureWalletAsync(userId);
        var balanceBefore = wallet.Balance;
        wallet.Balance += amount;
        wallet.UpdatedAt = DateTime.UtcNow;

        await _walletRepo.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = TransactionType.Win,
            Amount = amount,
            BalanceBefore = balanceBefore,
            BalanceAfter = wallet.Balance,
            Description = $"Win payout for prediction #{predictionId.ToString()[..8]}",
            RelatedEntityId = predictionId
        });

        await _unitOfWork.SaveChangesAsync();
        return true;
    }
}
