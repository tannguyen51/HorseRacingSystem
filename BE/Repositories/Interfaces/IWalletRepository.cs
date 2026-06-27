using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HorseRacing.Models;

namespace HorseRacing.Repositories.Interfaces;

public interface IWalletRepository
{
    Task<Wallet?> GetByUserIdAsync(Guid userId);
    Task AddAsync(Wallet wallet);
    Task AddTransactionAsync(WalletTransaction transaction);
    Task<List<WalletTransaction>> GetTransactionsByUserIdAsync(Guid userId);
    Task<WalletTransaction?> GetTransactionByIdAsync(Guid id);
}

public interface IBankAccountRepository
{
    Task<BankAccount?> GetByUserIdAsync(Guid userId);
    Task AddAsync(BankAccount bankAccount);
    Task UpdateAsync(BankAccount bankAccount);
}

public interface IWithdrawalRequestRepository
{
    Task AddAsync(WithdrawalRequest request);
    Task<WithdrawalRequest?> GetByIdAsync(Guid id);
    Task<List<WithdrawalRequest>> GetByUserIdAsync(Guid userId);
    Task<List<WithdrawalRequest>> GetAllAsync();
    Task<List<WithdrawalRequest>> GetPendingAsync();
    Task UpdateAsync(WithdrawalRequest request);
}

public interface IDepositRequestRepository
{
    Task AddAsync(DepositRequest request);
    Task<DepositRequest?> GetByIdAsync(Guid id);
    Task<List<DepositRequest>> GetByUserIdAsync(Guid userId);
    Task<List<DepositRequest>> GetAllAsync();
    Task<List<DepositRequest>> GetPendingAsync();
    Task UpdateAsync(DepositRequest request);
}
