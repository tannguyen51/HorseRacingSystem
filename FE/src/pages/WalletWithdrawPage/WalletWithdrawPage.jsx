import { useEffect, useState } from "react";
import {
  getWallet,
  registerBankAccount,
  createWithdrawal,
  getWithdrawalRequests,
} from "../../services/walletApi";
import { unwrapResponseData } from "../../services/authRoleUtils";
import "../../pages/SpectatorSharedLayout.css";
import "../WalletPage/WalletPage.css";
import "./WalletWithdrawPage.css";

function WalletWithdrawPage() {
  const [wallet, setWallet] = useState(null);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Bank account form
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [registeringBank, setRegisteringBank] = useState(false);

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showBankForm, setShowBankForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [walletRes, withdrawalsRes] = await Promise.all([
          getWallet(),
          getWithdrawalRequests(),
        ]);
        if (!cancelled) {
          const w = unwrapResponseData(walletRes);
          setWallet(w);
          const wr = unwrapResponseData(withdrawalsRes);
          setWithdrawHistory(Array.isArray(wr) ? wr : []);
          if (!w?.hasBankAccount) {
            setShowBankForm(true);
          }
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
    return new Date(value).toLocaleString("vi-VN");
  };

  const handleRegisterBank = async (e) => {
    e.preventDefault();
    setError("");
    setRegisteringBank(true);
    try {
      const res = await registerBankAccount({
        bankName,
        accountNumber,
        accountHolder,
      });
      setWallet(unwrapResponseData(res));
      setShowBankForm(false);
      setSuccessMsg("Đăng ký tài khoản ngân hàng thành công!");
    } catch (e) {
      setError(e.message || "Không thể đăng ký tài khoản ngân hàng.");
    } finally {
      setRegisteringBank(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const res = await createWithdrawal(parseFloat(withdrawAmount));
      setWallet(unwrapResponseData(res));
      setWithdrawAmount("");
      setSuccessMsg("Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong thời gian sớm nhất.");
      // Refresh history
      try {
        const wrRes = await getWithdrawalRequests();
        setWithdrawHistory(
          Array.isArray(unwrapResponseData(wrRes)) ? unwrapResponseData(wrRes) : [],
        );
      } catch {}
    } catch (e) {
      setError(e.message || "Không thể tạo yêu cầu rút tiền.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (status) => {
    const map = { Pending: "Chờ xử lý", Approved: "Đã duyệt", Rejected: "Từ chối", Completed: "Đã chuyển" };
    return map[status] || status;
  };

  const statusClass = (status) => {
    const map = { Pending: "tx-bet", Approved: "tx-deposit", Rejected: "tx-withdraw", Completed: "tx-win" };
    return map[status] || "";
  };

  if (loading) {
    return (
      <div className="spectator-page">
        <div className="spectator-layout">
          <div className="spectator-content"><p>Đang tải...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="spectator-page withdraw-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Rút tiền</p>
            <h3>Yêu cầu rút</h3>
            <p className="muted">Rút tiền từ ví về tài khoản ngân hàng.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Số dư</p>
            <h4 style={{ color: "#f2d28b" }}>{formatCurrency(wallet?.balance || 0)}</h4>
          </div>
          {wallet?.hasBankAccount && wallet?.bankAccount && (
            <div className="spectator-sidebar__card">
              <p className="muted">TK Ngân hàng</p>
              <h4>{wallet.bankAccount.bankName}</h4>
              <span>{wallet.bankAccount.accountNumber}</span>
              <p style={{ color: "#98a1b3", margin: "4px 0 0" }}>
                {wallet.bankAccount.accountHolder}
              </p>
            </div>
          )}
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Rút tiền</h1>
            <p>Yêu cầu rút tiền từ ví về tài khoản ngân hàng của bạn.</p>
          </section>

          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}

          {showBankForm || (!wallet?.hasBankAccount && !showBankForm) ? (
            <section>
              <h2>Đăng ký tài khoản ngân hàng</h2>
              <p className="muted">Vui lòng đăng ký tài khoản ngân hàng để rút tiền.</p>
              <form className="bank-form" onSubmit={handleRegisterBank}>
                <div className="form-group">
                  <label htmlFor="bankName" className="label-required">Tên ngân hàng</label>
                  <input
                    id="bankName"
                    className="form-input"
                    placeholder="VD: ACB, BIDV, Vietcombank..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    style={{ maxWidth: 400 }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountNumber" className="label-required">Số tài khoản</label>
                  <input
                    id="accountNumber"
                    className="form-input"
                    placeholder="Nhập số tài khoản"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    style={{ maxWidth: 400 }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="accountHolder" className="label-required">Chủ tài khoản</label>
                  <input
                    id="accountHolder"
                    className="form-input"
                    placeholder="VD: NGUYEN VAN A"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                    required
                    style={{ maxWidth: 400 }}
                  />
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={registeringBank}
                >
                  {registeringBank ? "Đang đăng ký..." : "Đăng ký tài khoản"}
                </button>
              </form>
            </section>
          ) : (
            <section>
              <h2>Tạo yêu cầu rút tiền</h2>
              <form className="withdraw-form" onSubmit={handleWithdraw}>
                <div className="form-group">
                  <label htmlFor="withdrawAmount" className="label-required">
                    Số tiền muốn rút (VND)
                  </label>
                  <input
                    id="withdrawAmount"
                    className="form-input"
                    type="number"
                    min="10000"
                    max={wallet?.balance || 0}
                    step="10000"
                    placeholder="100,000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    style={{ maxWidth: 400, fontSize: 20 }}
                  />
                  <p className="muted" style={{ marginTop: 8 }}>
                    Số dư khả dụng: {formatCurrency(wallet?.balance || 0)}
                  </p>
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    submitting ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) < 10000 ||
                    parseFloat(withdrawAmount) > (wallet?.balance || 0)
                  }
                >
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
                </button>
              </form>

              {wallet?.hasBankAccount && (
                <button
                  className="wallet-action-btn wallet-action--history"
                  style={{ marginTop: 16, display: "inline-block", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "8px 16px" }}
                  onClick={() => setShowBankForm(true)}
                >
                  Đổi tài khoản ngân hàng
                </button>
              )}
            </section>
          )}

          <section style={{ marginTop: 32 }}>
            <h2>Lịch sử rút tiền</h2>
            {withdrawHistory.length === 0 ? (
              <p className="muted">Chưa có yêu cầu rút tiền nào.</p>
            ) : (
              <div className="wallet-tx-list">
                {withdrawHistory.map((w) => (
                  <div key={w.id} className="wallet-tx-item">
                    <div>
                      <span className={`wallet-tx-type ${statusClass(w.status)}`}>
                        {statusLabel(w.status)}
                      </span>
                      <p className="wallet-tx-desc">
                        {formatCurrency(w.amount)}
                        {w.bankAccount && ` → ${w.bankAccount.bankName} ${w.bankAccount.accountNumber}`}
                      </p>
                      {w.adminNote && (
                        <p className="muted" style={{ fontSize: 12 }}>
                          Ghi chú: {w.adminNote}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="muted" style={{ fontSize: 12 }}>
                        {formatDate(w.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default WalletWithdrawPage;
