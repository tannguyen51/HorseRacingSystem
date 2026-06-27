using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HorseRacing.Data;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HorseRacing.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly ApplicationDbContext _db;

    public WalletRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<Wallet?> GetByUserIdAsync(Guid userId)
    {
        return _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
    }

    public Task AddAsync(Wallet wallet)
    {
        _db.Wallets.Add(wallet);
        return Task.CompletedTask;
    }

    public Task AddTransactionAsync(WalletTransaction transaction)
    {
        _db.WalletTransactions.Add(transaction);
        return Task.CompletedTask;
    }

    public Task<List<WalletTransaction>> GetTransactionsByUserIdAsync(Guid userId)
    {
        return _db.WalletTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public Task<WalletTransaction?> GetTransactionByIdAsync(Guid id)
    {
        return _db.WalletTransactions.FirstOrDefaultAsync(t => t.Id == id);
    }
}

public class BankAccountRepository : IBankAccountRepository
{
    private readonly ApplicationDbContext _db;

    public BankAccountRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task<BankAccount?> GetByUserIdAsync(Guid userId)
    {
        return _db.BankAccounts.FirstOrDefaultAsync(b => b.UserId == userId);
    }

    public Task AddAsync(BankAccount bankAccount)
    {
        _db.BankAccounts.Add(bankAccount);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(BankAccount bankAccount)
    {
        _db.BankAccounts.Update(bankAccount);
        return Task.CompletedTask;
    }
}

public class WithdrawalRequestRepository : IWithdrawalRequestRepository
{
    private readonly ApplicationDbContext _db;

    public WithdrawalRequestRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task AddAsync(WithdrawalRequest request)
    {
        _db.WithdrawalRequests.Add(request);
        return Task.CompletedTask;
    }

    public Task<WithdrawalRequest?> GetByIdAsync(Guid id)
    {
        return _db.WithdrawalRequests
            .Include(w => w.User)
            .Include(w => w.BankAccount)
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public Task<List<WithdrawalRequest>> GetByUserIdAsync(Guid userId)
    {
        return _db.WithdrawalRequests
            .Include(w => w.BankAccount)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public Task<List<WithdrawalRequest>> GetAllAsync()
    {
        return _db.WithdrawalRequests
            .Include(w => w.User)
            .Include(w => w.BankAccount)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public Task<List<WithdrawalRequest>> GetPendingAsync()
    {
        return _db.WithdrawalRequests
            .Include(w => w.User)
            .Include(w => w.BankAccount)
            .Where(w => w.Status == WithdrawalStatus.Pending)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    public Task UpdateAsync(WithdrawalRequest request)
    {
        _db.WithdrawalRequests.Update(request);
        return Task.CompletedTask;
    }
}

public class DepositRequestRepository : IDepositRequestRepository
{
    private readonly ApplicationDbContext _db;

    public DepositRequestRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public Task AddAsync(DepositRequest request)
    {
        _db.DepositRequests.Add(request);
        return Task.CompletedTask;
    }

    public Task<DepositRequest?> GetByIdAsync(Guid id)
    {
        return _db.DepositRequests
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public Task<List<DepositRequest>> GetByUserIdAsync(Guid userId)
    {
        return _db.DepositRequests
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public Task<List<DepositRequest>> GetAllAsync()
    {
        return _db.DepositRequests
            .Include(d => d.User)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public Task<List<DepositRequest>> GetPendingAsync()
    {
        return _db.DepositRequests
            .Include(d => d.User)
            .Where(d => d.Status == DepositStatus.Pending)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public Task UpdateAsync(DepositRequest request)
    {
        _db.DepositRequests.Update(request);
        return Task.CompletedTask;
    }
}
