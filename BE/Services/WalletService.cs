using System;
using System.Threading.Tasks;
using HorseRacing.Models;
using HorseRacing.Repositories.Interfaces;
using HorseRacing.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HorseRacing.Services;

public class WalletService : IWalletService
{
    private readonly IWalletRepository _walletRepo;
    private readonly IUserRepository _userRepo;
    private readonly IUnitOfWork _unitOfWork;

    public WalletService(
        IWalletRepository walletRepo,
        IUserRepository userRepo,
        IUnitOfWork unitOfWork)
    {
        _walletRepo = walletRepo;
        _userRepo = userRepo;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<object>> GetBalanceAsync(Guid userId)
    {
        var wallet = await GetOrCreateWalletAsync(userId);
        return ServiceResult<object>.Ok(new { balance = wallet.Balance });
    }

    public async Task<ServiceResult<object>> AddFundsAsync(Guid userId, decimal amount, string reference)
    {
        if (amount <= 0)
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Số tiền không hợp lệ.");

        await GetOrCreateWalletAsync(userId);
        var updated = await _walletRepo.AddBalanceAsync(userId, amount);
        if (!updated)
            return ServiceResult<object>.Fail(StatusCodes.Status500InternalServerError, "Không thể cập nhật số dư.");

        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        return ServiceResult<object>.Ok(new { balance = wallet!.Balance, added = amount });
    }

    public async Task<ServiceResult<object>> DeductFundsAsync(Guid userId, decimal amount, string reference)
    {
        if (amount <= 0)
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Số tiền không hợp lệ.");

        var updated = await _walletRepo.DeductBalanceAsync(userId, amount);
        if (!updated)
            return ServiceResult<object>.Fail(StatusCodes.Status400BadRequest, "Số dư không đủ.");

        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        return ServiceResult<object>.Ok(new { balance = wallet!.Balance, deducted = amount });
    }

    private async Task<Wallet> GetOrCreateWalletAsync(Guid userId)
    {
        var wallet = await _walletRepo.GetByUserIdAsync(userId);
        if (wallet != null) return wallet;

        wallet = new Wallet
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Balance = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _walletRepo.AddAsync(wallet);
        await _unitOfWork.SaveChangesAsync();
        return wallet;
    }
}
