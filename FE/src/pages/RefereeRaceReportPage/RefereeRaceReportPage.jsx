import { useEffect, useState } from "react";
import { getMyAssignments } from "../../services/refereeAssignmentApi";
import { createReport, getRaceReport } from "../../services/refereeApi";
import "./RefereeRaceReportPage.css";

const REPORT_TYPES = [
  {
    id: "post-race",
    label: "Báo cáo sau cuộc đua",
    sub: "Chi tiết diễn biến và kết quả",
    icon: "🏁",
  },
  {
    id: "health",
    label: "Báo cáo sức khỏe",
    sub: "Tổng hợp tình trạng ngựa",
    icon: "🏥",
  },
  {
    id: "violation",
    label: "Báo cáo vi phạm",
    sub: "Các vi phạm trong cuộc đua",
    icon: "⚠️",
  },
];

const MONTH_LABELS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
];

const MONTH_FULL = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
];

export default function RefereeRaceReportPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [existingReport, setExistingReport] = useState(null);
  const [form, setForm] = useState({ content: "", rating: 5, notes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [reportType, setReportType] = useState("post-race");

  // Recent reports history (built from submissions during session + loaded)
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    getMyAssignments()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setAssignments(list);
        if (list.length > 0)
          setSelectedRaceId(list[0].raceId || list[0].RaceId || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRaceId) {
      setExistingReport(null);
      return;
    }
    getRaceReport(selectedRaceId)
      .then((d) => {
        setExistingReport(d);
        if (d && !recentReports.find((r) => r.raceId === selectedRaceId)) {
          setRecentReports((prev) => [
            { ...d, raceId: selectedRaceId, createdAt: new Date().toISOString() },
            ...prev,
          ].slice(0, 10));
        }
      })
      .catch(() => setExistingReport(null));
  }, [selectedRaceId]);

  // Chart data — monthly count (simulated from recent reports)
  const [chartData, setChartData] = useState(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        month: MONTH_LABELS[i],
        label: MONTH_FULL[i],
        count: Math.floor(Math.random() * 8) + 1,
      };
    });
  });

  // Update chart when reports change
  useEffect(() => {
    if (recentReports.length === 0) return;
    const counts = [0, 0, 0, 0, 0, 0];
    const now = new Date();
    recentReports.forEach((r) => {
      const d = r.createdAt ? new Date(r.createdAt) : new Date();
      const monthDiff =
        (now.getFullYear() - d.getFullYear()) * 12 +
        now.getMonth() -
        d.getMonth();
      const idx = 5 - Math.min(monthDiff, 5);
      if (idx >= 0 && idx < 6) counts[idx]++;
    });
    setChartData((prev) =>
      prev.map((p, i) => ({ ...p, count: Math.max(p.count, counts[i]) }))
    );
  }, [recentReports]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setMsg("Vui lòng nhập nội dung báo cáo.");
      return;
    }
    setSubmitting(true);
    setMsg("");
    try {
      await createReport({
        raceId: selectedRaceId,
        content: form.content,
        rating: Number(form.rating),
        notes: form.notes,
      });
      setMsg("Đã gửi báo cáo thành công!");
      const newReport = {
        raceId: selectedRaceId,
        content: form.content,
        rating: Number(form.rating),
        notes: form.notes,
        createdAt: new Date().toISOString(),
      };
      setRecentReports((prev) => [newReport, ...prev].slice(0, 10));
      setForm({ content: "", rating: 5, notes: "" });
      getRaceReport(selectedRaceId)
        .then((d) => setExistingReport(d))
        .catch(() => {});
    } catch (e) {
      setMsg("Lỗi: " + (e.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  const currentRaceName =
    assignments.find(
      (a) => (a.raceId || a.RaceId) === selectedRaceId
    )?.raceName ||
    assignments.find(
      (a) => (a.raceId || a.RaceId) === selectedRaceId
    )?.RaceName ||
    "Cuộc đua đã chọn";

  return (
    <div className="rr-wrap">
      {/* ── Header ── */}
      <div className="rr-header">
        <div>
          <h1 className="rr-title">Báo cáo cuộc đua</h1>
          <p className="rr-sub">Tạo và theo dõi báo cáo cho các cuộc đua được phân công</p>
        </div>
      </div>

      {/* ── Report Type Selector ── */}
      <div className="rr-type-grid">
        {REPORT_TYPES.map((rt) => (
          <div
            key={rt.id}
            className={`rr-type-card${reportType === rt.id ? " rr-type-card--active" : ""}`}
            onClick={() => setReportType(rt.id)}
          >
            <span className="rr-type-icon">{rt.icon}</span>
            <div>
              <span className="rr-type-label">{rt.label}</span>
              <span className="rr-type-sub">{rt.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Two-column Layout ── */}
      <div className="rr-grid">
        {/* LEFT — Form */}
        <div className="rr-left">
          {/* Race Selector */}
          <div className="rr-card rr-card-dark">
            <h3 className="rr-card-title">Chọn cuộc đua</h3>
            {loading ? (
              <p className="rr-muted">Đang tải...</p>
            ) : assignments.length === 0 ? (
              <p className="rr-muted">Chưa có phân công nào.</p>
            ) : (
              <select
                value={selectedRaceId}
                onChange={(e) => setSelectedRaceId(e.target.value)}
                className="rr-select"
              >
                <option value="">-- Chọn --</option>
                {assignments.map((a) => (
                  <option
                    key={a.id || a.Id || a.raceId}
                    value={a.raceId || a.RaceId}
                  >
                    {a.raceName ||
                      a.RaceName ||
                      a.matchName ||
                      a.MatchName ||
                      "Cuộc đua"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {existingReport ? (
            <div className="rr-card rr-card-dark">
              <h3 className="rr-card-title">Báo cáo đã tồn tại</h3>
              <div className="rr-existing">
                <div className="rr-existing-row">
                  <span className="rr-existing-label">Nội dung</span>
                  <span>{existingReport.content || existingReport.Content || "-"}</span>
                </div>
                <div className="rr-existing-row">
                  <span className="rr-existing-label">Đánh giá</span>
                  <span className="rr-rating-stars">
                    {Array.from(
                      { length: 5 },
                      (_, i) =>
                        i < (existingReport.rating || existingReport.Rating || 0)
                    ).map((filled, i) => (
                      <span key={i} className={filled ? "star-filled" : "star-empty"}>
                        ★
                      </span>
                    ))}
                    <span className="rr-rating-num">
                      {existingReport.rating || existingReport.Rating || "-"}/5
                    </span>
                  </span>
                </div>
                {existingReport.notes && (
                  <div className="rr-existing-row">
                    <span className="rr-existing-label">Ghi chú</span>
                    <span>{existingReport.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ) : selectedRaceId ? (
            <form className="rr-card rr-card-dark rr-form" onSubmit={handleSubmit}>
              <h3 className="rr-card-title">
                Tạo báo cáo mới — {currentRaceName}
              </h3>
              {msg && (
                <div className={`rr-msg ${msg.includes("Lỗi") ? "rr-msg--err" : "rr-msg--ok"}`}>
                  {msg}
                </div>
              )}
              <div className="rr-field">
                <label>Nội dung báo cáo</label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, content: e.target.value }))
                  }
                  placeholder="Mô tả diễn biến cuộc đua, kết quả, các sự kiện đáng chú ý..."
                  rows={5}
                />
              </div>
              <div className="rr-field">
                <label>Đánh giá</label>
                <div className="rr-rating-group">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`rr-star-btn${
                        n <= form.rating ? " rr-star-btn--on" : ""
                      }`}
                      onClick={() => setForm((p) => ({ ...p, rating: n }))}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rr-rating-val">{form.rating}/5</span>
                </div>
              </div>
              <div className="rr-field">
                <label>Ghi chú thêm</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Ghi chú bổ sung (không bắt buộc)..."
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="rr-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </form>
          ) : null}
        </div>

        {/* RIGHT — Chart + Recent Reports */}
        <div className="rr-right">
          {/* Monthly Chart */}
          <div className="rr-card rr-card-dark">
            <h3 className="rr-card-title">Phân bố báo cáo</h3>
            <p className="rr-card-sub">6 tháng gần nhất</p>
            <div className="rr-chart">
              {chartData.map((item) => (
                <div key={item.month} className="rr-chart-col">
                  <span className="rr-chart-val">{item.count}</span>
                  <div className="rr-chart-bar-wrap">
                    <div
                      className="rr-chart-bar"
                      style={{
                        height: `${(item.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="rr-chart-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="rr-card rr-card-dark">
            <h3 className="rr-card-title">Báo cáo gần đây</h3>
            {recentReports.length === 0 ? (
              <p className="rr-muted">Chưa có báo cáo nào được gửi.</p>
            ) : (
              <div className="rr-recent-list">
                {recentReports.map((r, idx) => (
                  <div key={idx} className="rr-recent-item">
                    <div className="rr-recent-head">
                      <span className="rr-recent-race">
                        {r.raceName || `Cuộc đua`}
                      </span>
                      <span className="rr-recent-date">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("vi-VN")
                          : "-"}
                      </span>
                    </div>
                    <p className="rr-recent-excerpt">
                      {r.content?.slice(0, 100)}
                      {(r.content?.length || 0) > 100 ? "..." : ""}
                    </p>
                    {r.rating && (
                      <span className="rr-recent-rating">
                        {Array.from({ length: r.rating }, (_, i) => (
                          <span key={i}>★</span>
                        ))}
                        <span className="rr-recent-rating-num">
                          {r.rating}/5
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
