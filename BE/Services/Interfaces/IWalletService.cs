using System;
using System.Threading.Tasks;

namespace HorseRacing.Services.Interfaces;

public interface IWalletService
{
    Task<ServiceResult<object>> GetBalanceAsync(Guid userId);
    Task<ServiceResult<object>> AddFundsAsync(Guid userId, decimal amount, string reference);
    Task<ServiceResult<object>> DeductFundsAsync(Guid userId, decimal amount, string reference);
}
