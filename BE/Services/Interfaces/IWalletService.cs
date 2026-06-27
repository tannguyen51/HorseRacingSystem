using System;
using System.Threading.Tasks;
using HorseRacing.Dtos;
using HorseRacing.Services;

namespace HorseRacing.Services.Interfaces;

public interface IWalletService
{
    // Spectator wallet
    Task<ServiceResult<WalletResponse>> GetWalletAsync(Guid userId);
    Task<ServiceResult<WalletResponse>> CreateDepositRequestAsync(Guid userId, DepositRequestDto dto);
    Task<ServiceResult<WalletResponse>> RegisterBankAccountAsync(Guid userId, BankAccountDto dto);
    Task<ServiceResult<WalletResponse>> CreateWithdrawalRequestAsync(Guid userId, WithdrawRequestDto dto);

    // Transactions
    Task<ServiceResult<object>> GetTransactionsAsync(Guid userId);
    Task<ServiceResult<object>> GetDepositRequestsAsync(Guid userId);
    Task<ServiceResult<object>> GetWithdrawalRequestsAsync(Guid userId);

    // Sepay config
    Task<ServiceResult<SepayConfigResponse>> GetSepayConfigAsync();

    // Admin
    Task<ServiceResult<object>> AdminGetPendingDepositsAsync();
    Task<ServiceResult<object>> AdminProcessDepositAsync(Guid depositId, ProcessDepositDto dto, Guid adminId);
    Task<ServiceResult<object>> AdminGetPendingWithdrawalsAsync();
    Task<ServiceResult<object>> AdminGetAllWithdrawalsAsync();
    Task<ServiceResult<object>> AdminProcessWithdrawalAsync(Guid withdrawalId, ProcessWithdrawalDto dto, Guid adminId);

    // Internal: used by PredictionService
    Task<bool> DeductBetAsync(Guid userId, decimal amount, Guid predictionId);
    Task<bool> CreditWinAsync(Guid userId, decimal amount, Guid predictionId);
}
