import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getWallet,
  getTransactions,
} from "../../services/walletApi";
import { unwrapResponseData } from "../../services/authRoleUtils";
import "../../pages/SpectatorSharedLayout.css";
import "./WalletPage.css";

function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [walletRes, txRes] = await Promise.all([
          getWallet(),
          getTransactions(),
        ]);
        if (!cancelled) {
          setWallet(unwrapResponseData(walletRes));
          const txs = unwrapResponseData(txRes);
          setRecentTransactions(
            Array.isArray(txs) ? txs.slice(0, 5) : [],
          );
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Unable to load wallet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const formatDate = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    return d.toLocaleString("vi-VN");
  };

  const typeLabel = (type) => {
    const map = {
      Deposit: "Nạp tiền",
      Withdraw: "Rút tiền",
      Bet: "Đặt cược",
      Win: "Thắng cược",
      Refund: "Hoàn tiền",
    };
    return map[type] || type;
  };

  const typeClass = (type) => {
    const map = {
      Deposit: "tx-deposit",
      Withdraw: "tx-withdraw",
      Bet: "tx-bet",
      Win: "tx-win",
      Refund: "tx-refund",
    };
    return map[type] || "";
  };

  return (
    <div className="spectator-page wallet-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Ví của tôi</p>
            <h3>Tài khoản</h3>
            <p className="muted">Quản lý số dư và giao dịch.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Số dư hiện tại</p>
            <h4 style={{ fontSize: 28, color: "#f2d28b" }}>
              {loading ? "..." : formatCurrency(wallet?.balance || 0)}
            </h4>
          </div>
          <div className="wallet-quick-actions">
            <Link to="/spectator/wallet/deposit" className="wallet-action-btn wallet-action--deposit">
              Nạp tiền
            </Link>
            <Link to="/spectator/wallet/withdraw" className="wallet-action-btn wallet-action--withdraw">
              Rút tiền
            </Link>
          </div>
          <Link
            to="/spectator/wallet/transactions"
            className="wallet-action-btn wallet-action--history"
            style={{ marginTop: 8 }}
          >
            Lịch sử giao dịch
          </Link>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Ví điện tử</h1>
            <p>Nạp tiền, rút tiền và theo dõi giao dịch cá cược.</p>
          </section>

          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <>
              <section className="wallet-balance-card">
                <div className="wallet-balance-card__info">
                  <p className="muted">Số dư khả dụng</p>
                  <h2>{formatCurrency(wallet?.balance || 0)}</h2>
                  {wallet?.hasBankAccount && wallet?.bankAccount && (
                    <div className="wallet-bank-info">
                      <span className="pill">TK Ngân hàng</span>
                      <p>
                        {wallet.bankAccount.bankName} - {wallet.bankAccount.accountNumber}
                      </p>
                      <p className="muted">{wallet.bankAccount.accountHolder}</p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2>Giao dịch gần đây</h2>
                {recentTransactions.length === 0 ? (
                  <p className="muted">Chưa có giao dịch nào.</p>
                ) : (
                  <div className="wallet-tx-list">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className={`wallet-tx-item ${typeClass(tx.type)}`}>
                        <div className="wallet-tx-item__left">
                          <span className={`wallet-tx-type ${typeClass(tx.type)}`}>
                            {typeLabel(tx.type)}
                          </span>
                          <div>
                            <p className="wallet-tx-desc">{tx.description || "--"}</p>
                            <p className="muted" style={{ fontSize: 12 }}>
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="wallet-tx-item__right">
                          <strong
                            className={
                              tx.type === "Deposit" || tx.type === "Win" || tx.type === "Refund"
                                ? "amount-plus"
                                : "amount-minus"
                            }
                          >
                            {tx.type === "Deposit" || tx.type === "Win" || tx.type === "Refund"
                              ? "+"
                              : "-"}
                            {formatCurrency(tx.amount)}
                          </strong>
                          <span className="muted" style={{ fontSize: 12 }}>
                            Số dư: {formatCurrency(tx.balanceAfter)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {recentTransactions.length > 0 && (
                  <Link
                    to="/spectator/wallet/transactions"
                    className="wallet-view-all"
                  >
                    Xem tất cả giao dịch
                  </Link>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
