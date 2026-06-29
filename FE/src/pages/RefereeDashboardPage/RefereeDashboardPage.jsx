import { useState, useEffect } from "react";
import { getMyAssignments } from "../../services/refereeAssignmentApi";
import "../RefereeSharedLayout.css";
import "./RefereeDashboardPage.css";

const fDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Chưa xác định";

function RefereeDashboardPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAssignments()
      .then((d) => setAssignments(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pending = assignments.filter((a) => a.status === "Assigned");
  const confirmed = assignments.filter((a) => a.status === "Confirmed");
  const completed = assignments.filter((a) => a.status === "Completed");

  return (
    <div className="referee-page">
      <div className="referee-layout">
        <aside className="referee-sidebar">
          <div className="referee-sidebar__header">
            <p className="pill">Trọng tài</p>
            <h3>Trọng tài</h3>
            <p className="muted">Quản lý phân công và nhiệm vụ.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Đang chờ</p><h4>{pending.length}</h4>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Đã xác nhận</p><h4>{confirmed.length}</h4>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Bảng điều khiển trọng tài</span>
              <h1>Chào mừng trở lại, Trọng tài</h1>
              <p>Quản lý phân công trận đấu và duy trì tiêu chuẩn liêm chính cao nhất.</p>
            </div>
            <div className="referee-hero__panel">
              <span>Tổng phân công</span><strong>{assignments.length}</strong>
            </div>
          </section>

          <section className="referee-stats">
            {[{ label: "Đang chờ", value: pending.length }, { label: "Đã xác nhận", value: confirmed.length }, { label: "Đã hoàn thành", value: completed.length }].map((s, i) => (
              <div key={i} className="stat-card"><h3>{s.value}</h3><p>{s.label}</p></div>
            ))}
          </section>

          {error && <p className="form-error">{error}</p>}
          {loading ? <p>Đang tải phân công...</p> : assignments.length === 0 ? <p className="muted">Chưa có phân công nào.</p> : (
            <section className="referee-section">
              <h2>Phân công sắp tới</h2>
              <div className="referee-card-grid">
                {assignments.slice(0, 6).map((a) => (
                  <div key={a.id} className="referee-card">
                    <span className="badge">{a.status}</span>
                    <h3>{a.raceName || "Cuộc đua"}</h3>
                    <p>{a.role || "Trọng tài"}</p>
                    <p className="time">{fDate(a.assignedAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default RefereeDashboardPage;
