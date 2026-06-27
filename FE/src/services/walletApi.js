import { request } from "./apiClient";

// Wallet
export const getWallet = () => request("/api/wallet");

// Sepay config (bank details for QR)
export const getSepayConfig = () => request("/api/wallet/sepay-config");

// Deposit
export const createDeposit = (amount) =>
  request("/api/wallet/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
export const getDepositRequests = () => request("/api/wallet/deposits");

// Bank account
export const registerBankAccount = (data) =>
  request("/api/wallet/bank-account", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Withdraw
export const createWithdrawal = (amount) =>
  request("/api/wallet/withdraw", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
export const getWithdrawalRequests = () => request("/api/wallet/withdrawals");

// Transactions
export const getTransactions = () => request("/api/wallet/transactions");

// Admin endpoints
export const adminGetPendingDeposits = () =>
  request("/api/wallet/admin/pending-deposits");

export const adminSyncSepay = () =>
  request("/api/wallet/admin/sync-sepay", { method: "POST" });

export const adminProcessDeposit = (depositId, approved) =>
  request(`/api/wallet/admin/deposits/${depositId}/process`, {
    method: "POST",
    body: JSON.stringify({ approved }),
  });

export const adminGetPendingWithdrawals = () =>
  request("/api/wallet/admin/pending-withdrawals");

export const adminGetAllWithdrawals = () =>
  request("/api/wallet/admin/withdrawals");

export const adminProcessWithdrawal = (withdrawalId, approved, adminNote) =>
  request(`/api/wallet/admin/withdrawals/${withdrawalId}/process`, {
    method: "POST",
    body: JSON.stringify({ approved, adminNote }),
  });
