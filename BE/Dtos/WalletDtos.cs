using System;
using System.ComponentModel.DataAnnotations;

namespace HorseRacing.Dtos;

public class DepositRequestDto
{
    [Required]
    [Range(10000, double.MaxValue, ErrorMessage = "Minimum deposit is 10,000 VND")]
    public decimal Amount { get; set; }
}

public class WithdrawRequestDto
{
    [Required]
    [Range(10000, double.MaxValue, ErrorMessage = "Minimum withdrawal is 10,000 VND")]
    public decimal Amount { get; set; }
}

public class BankAccountDto
{
    [Required]
    [MaxLength(200)]
    public string BankName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string AccountHolder { get; set; } = string.Empty;
}

public class WalletResponse
{
    public Guid Id { get; set; }
    public decimal Balance { get; set; }
    public bool HasBankAccount { get; set; }
    public BankAccountInfo? BankAccount { get; set; }
}

public class BankAccountInfo
{
    public Guid Id { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
}

public class TransactionResponse
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DepositRequestResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

public class WithdrawalRequestResponse
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public BankAccountInfo? BankAccount { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

public class AdminDepositResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminWithdrawalResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public BankAccountInfo? BankAccount { get; set; }
    public string? AdminNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
}

public class ProcessWithdrawalDto
{
    [Required]
    public bool Approved { get; set; }

    [MaxLength(500)]
    public string? AdminNote { get; set; }
}

public class ProcessDepositDto
{
    [Required]
    public bool Approved { get; set; }
}

public class SepayConfigResponse
{
    public string BankId { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountHolder { get; set; } = string.Empty;
    public string Template { get; set; } = "compact2";
}
