import { useEffect, useState } from "react";
import { getTransactions } from "../../services/walletApi";
import { unwrapResponseData } from "../../services/authRoleUtils";
import "../../pages/SpectatorSharedLayout.css";
import "../WalletPage/WalletPage.css";
import "./WalletTransactionsPage.css";

function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getTransactions();
        if (!cancelled) {
          const data = unwrapResponseData(res);
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
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
    return new Date(value).toLocaleString("vi-VN");
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
    <div className="spectator-page tx-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Giao dịch</p>
            <h3>Lịch sử</h3>
            <p className="muted">Toàn bộ giao dịch trong ví.</p>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Lịch sử giao dịch</h1>
            <p>Xem tất cả các giao dịch nạp, rút, cá cược và thắng cược.</p>
          </section>

          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <p>Đang tải...</p>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <h4>Chưa có giao dịch nào</h4>
              <p>Nạp tiền vào ví để bắt đầu cá cược.</p>
            </div>
          ) : (
            <div className="wallet-tx-list">
              {transactions.map((tx) => (
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
        </div>
      </div>
    </div>
  );
}

export default WalletTransactionsPage;
