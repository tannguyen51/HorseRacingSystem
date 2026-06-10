import { useState, useEffect } from "react";
import { getMyAssignments } from "../../services/refereeAssignmentApi";
import "../RefereeSharedLayout.css";
import "./RefereeDashboardPage.css";

const fDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "TBD";

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
            <p className="pill">Referee</p>
            <h3>Match Official</h3>
            <p className="muted">Manage assignments and duties.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Pending</p><h4>{pending.length}</h4>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Confirmed</p><h4>{confirmed.length}</h4>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Referee dashboard</span>
              <h1>Welcome back, Official</h1>
              <p>Manage your match assignments and maintain the highest standards of integrity.</p>
            </div>
            <div className="referee-hero__panel">
              <span>Total Assignments</span><strong>{assignments.length}</strong>
            </div>
          </section>

          <section className="referee-stats">
            {[{ label: "Pending", value: pending.length }, { label: "Confirmed", value: confirmed.length }, { label: "Completed", value: completed.length }].map((s, i) => (
              <div key={i} className="stat-card"><h3>{s.value}</h3><p>{s.label}</p></div>
            ))}
          </section>

          {error && <p className="form-error">{error}</p>}
          {loading ? <p>Loading assignments...</p> : assignments.length === 0 ? <p className="muted">No assignments yet.</p> : (
            <section className="referee-section">
              <h2>Upcoming Assignments</h2>
              <div className="referee-card-grid">
                {assignments.slice(0, 6).map((a) => (
                  <div key={a.id} className="referee-card">
                    <span className="badge">{a.status}</span>
                    <h3>{a.raceName || "Race"}</h3>
                    <p>{a.role || "Referee"}</p>
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
