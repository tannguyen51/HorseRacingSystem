import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  createDeposit,
  getSepayConfig,
  getDepositRequests,
} from "../../services/walletApi";
import { unwrapResponseData } from "../../services/authRoleUtils";
import "../../pages/SpectatorSharedLayout.css";
import "./WalletDepositPage.css";

function WalletDepositPage() {
  const [amount, setAmount] = useState("");
  const [sepayConfig, setSepayConfig] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [depositId, setDepositId] = useState(null);
  const [depositHistory, setDepositHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [configRes, depositsRes] = await Promise.all([
          getSepayConfig(),
          getDepositRequests(),
        ]);
        if (!cancelled) {
          setSepayConfig(unwrapResponseData(configRes));
          const deposits = unwrapResponseData(depositsRes);
          setDepositHistory(Array.isArray(deposits) ? deposits : []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await createDeposit(parseFloat(amount));
      const data = unwrapResponseData(res);
      setDepositId(data?.id);
      setShowQR(true);
      // Refresh deposit history
      try {
        const depositsRes = await getDepositRequests();
        const deposits = unwrapResponseData(depositsRes);
        setDepositHistory(Array.isArray(deposits) ? deposits : []);
      } catch {}
    } catch (e) {
      setError(e.message || "Không thể tạo yêu cầu nạp tiền.");
    } finally {
      setSubmitting(false);
    }
  };

  const getVietQRUrl = () => {
    if (!sepayConfig) return "";
    const cfg = sepayConfig;
    const desc = encodeURIComponent(`RCMS NAP TIEN`);
    return `https://img.vietqr.io/image/${cfg.bankId}-${cfg.accountNumber}-${cfg.template}.png?amount=${amount}&addInfo=${desc}&accountName=${encodeURIComponent(cfg.accountHolder)}`;
  };

  const statusLabel = (status) => {
    const map = { Pending: "Chờ duyệt", Completed: "Đã duyệt", Cancelled: "Đã hủy" };
    return map[status] || status;
  };

  const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleString("vi-VN");
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
    <div className="spectator-page deposit-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Nạp tiền</p>
            <h3>Sepay QR</h3>
            <p className="muted">Nạp tiền qua chuyển khoản ngân hàng.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Ngân hàng</p>
            <h4>{sepayConfig?.bankId || "--"}</h4>
            <span>{sepayConfig?.accountNumber || "--"}</span>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Chủ TK</p>
            <h4>{sepayConfig?.accountHolder || "--"}</h4>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Nạp tiền qua Sepay</h1>
            <p>Nhập số tiền muốn nạp, quét mã QR để chuyển khoản.</p>
          </section>

          {error && <div className="form-error">{error}</div>}

          {!showQR ? (
            <form className="deposit-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="amount" className="label-required">
                  Số tiền muốn nạp (VND)
                </label>
                <input
                  id="amount"
                  className="form-input"
                  type="number"
                  min="10000"
                  step="10000"
                  placeholder="100,000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ maxWidth: 400, fontSize: 20 }}
                />
                <p className="muted" style={{ marginTop: 8 }}>
                  Tối thiểu: {formatCurrency(10000)}
                </p>
              </div>
              <button
                type="submit"
                className="primary-button"
                disabled={submitting || !amount || parseFloat(amount) < 10000}
              >
                {submitting ? "Đang tạo..." : "Tạo mã QR"}
              </button>
            </form>
          ) : (
            <div className="qr-section">
              <div className="qr-card">
                <h3>Quét mã QR để thanh toán</h3>
                <div className="qr-wrapper">
                  <QRCodeSVG
                    value={getVietQRUrl()}
                    size={260}
                    level="M"
                    includeMargin
                  />
                </div>
                <div className="qr-info">
                  <div className="qr-info-row">
                    <span>Ngân hàng:</span>
                    <strong>{sepayConfig?.bankId}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Số TK:</span>
                    <strong>{sepayConfig?.accountNumber}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Chủ TK:</span>
                    <strong>{sepayConfig?.accountHolder}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Số tiền:</span>
                    <strong style={{ color: "#f2d28b", fontSize: 20 }}>
                      {formatCurrency(parseFloat(amount))}
                    </strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Nội dung CK:</span>
                    <strong>RCMS NAP TIEN</strong>
                  </div>
                </div>
                <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
                  Sau khi chuyển khoản, admin sẽ xác nhận và cộng tiền vào ví của bạn.
                </p>
                <button
                  className="wallet-action-btn wallet-action--history"
                  style={{ width: "100%", marginTop: 12 }}
                  onClick={() => {
                    setShowQR(false);
                    setAmount("");
                    setDepositId(null);
                  }}
                >
                  Tạo mã QR khác
                </button>
              </div>
            </div>
          )}

          <section style={{ marginTop: 32 }}>
            <h2>Lịch sử nạp tiền</h2>
            {depositHistory.length === 0 ? (
              <p className="muted">Chưa có yêu cầu nạp tiền nào.</p>
            ) : (
              <div className="wallet-tx-list">
                {depositHistory.map((d) => (
                  <div key={d.id} className="wallet-tx-item">
                    <div>
                      <span className="wallet-tx-type tx-deposit">Nạp tiền</span>
                      <p className="wallet-tx-desc">
                        {formatCurrency(d.amount)} - {statusLabel(d.status)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="muted" style={{ fontSize: 12 }}>
                        {formatDate(d.createdAt)}
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

export default WalletDepositPage;
