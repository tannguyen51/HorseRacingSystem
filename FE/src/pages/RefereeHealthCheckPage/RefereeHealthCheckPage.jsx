import { useState, useEffect } from "react";
import {
  getRaceHealthChecks,
  createHealthCheck,
  approveHorseForRace,
  rejectHorseForRace,
  getRaceEntries,
} from "../../services/refereeApi";
import { getMyAssignments } from "../../services/refereeAssignmentApi";
import "../RefereeSharedLayout.css";
import "./RefereeHealthCheckPage.css";

const STATUS_MAP = {
  Passed: "Passed",
  Failed: "Failed",
  RequiresRecheck: "Requires Recheck",
};

const STATUS_OPTIONS = ["Passed", "Failed", "RequiresRecheck"];

function RefereeHealthCheckPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [healthChecks, setHealthChecks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    horseId: "",
    raceId: "",
    refereeId: "",
    healthCheckStatus: "Passed",
    observations: "",
  });

  useEffect(() => {
    let ignore = false;
    const fetchAssignments = async () => {
      try {
        const data = await getMyAssignments();
        if (!ignore) setAssignments(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setError("Failed to load assignments: " + e.message);
      }
    };
    fetchAssignments();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!selectedRaceId) return;
    let ignore = false;
    const fetchEntries = async () => {
      try {
        const data = await getRaceEntries(selectedRaceId);
        if (!ignore) setEntries(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
      } catch { if (!ignore) setEntries([]); }
    };
    fetchEntries();
    return () => { ignore = true; };
  }, [selectedRaceId]);

  const loadHealthChecks = async (raceId) => {
    setLoading(true);
    setError("");
    try {
      const data = await getRaceHealthChecks(raceId);
      setHealthChecks(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load health checks: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceSelect = (raceId) => {
    setSelectedRaceId(raceId);
    setEntries([]);
    if (raceId) {
      loadHealthChecks(raceId);
      const assignment = assignments.find((a) => a.raceId === raceId);
      setForm((f) => ({
        ...f,
        raceId,
        horseId: "",
        refereeId: assignment?.refereeId || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!form.horseId || !form.raceId || !form.refereeId) {
      setError("All fields are required.");
      return;
    }
    try {
      await createHealthCheck({
        horseId: form.horseId,
        raceId: form.raceId,
        refereeId: form.refereeId,
        healthCheckStatus: form.healthCheckStatus,
        observations: form.observations || undefined,
      });
      setSuccessMsg("Health check created successfully.");
      setShowForm(false);
      setForm((f) => ({ ...f, horseId: "", healthCheckStatus: "Passed", observations: "" }));
      if (selectedRaceId) loadHealthChecks(selectedRaceId);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleApprove = async (checkId) => {
    try {
      await approveHorseForRace(checkId);
      loadHealthChecks(selectedRaceId);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async (checkId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await rejectHorseForRace(checkId, reason);
      loadHealthChecks(selectedRaceId);
    } catch (e) {
      setError(e.message);
    }
  };

  const assignedRaces = [...new Map(assignments.map((a) => [a.raceId, a])).values()];

  return (
    <div className="referee-page referee-health">
      <div className="referee-layout">
        <aside className="referee-sidebar">
          <div className="referee-sidebar__header">
            <p className="pill">Referee</p>
            <h3>Health Checks</h3>
            <p className="muted">Pre-race horse inspections.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Assigned Races</p>
            <h4>{assignments.length} races</h4>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Race Day</span>
              <h1>Horse Health Checks</h1>
              <p>Inspect horses before each race to ensure they are fit to compete.</p>
            </div>
          </section>

          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}

          <section className="referee-section">
            <div className="section-heading">
              <h2>Select Race</h2>
            </div>
            <select
              className="form-select"
              value={selectedRaceId}
              onChange={(e) => handleRaceSelect(e.target.value)}
            >
              <option value="">-- Choose a race --</option>
              {assignedRaces.map((a) => (
                <option key={a.raceId} value={a.raceId}>
                  {a.raceName || a.raceId}
                </option>
              ))}
            </select>
          </section>

          {selectedRaceId && (
            <section className="referee-section">
              <div className="section-heading">
                <h2>Health Checks</h2>
                <button className="primary-button" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Cancel" : "+ New Check"}
                </button>
              </div>

              {showForm && (
                <form className="health-check-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="label-required">Horse</label>
                    <select
                      className="form-select"
                      value={form.horseId}
                      onChange={(e) => setForm({ ...form, horseId: e.target.value })}
                      required
                    >
                      <option value="">-- Select a horse --</option>
                      {entries.map((entry) => (
                        <option key={entry.horseId} value={entry.horseId}>
                          {entry.horseName} {entry.jockeyName ? `(Jockey: ${entry.jockeyName})` : ""}
                        </option>
                      ))}
                    </select>
                    {entries.length === 0 && (
                      <p className="muted">No horses assigned to this race. Assign horses first in Admin.</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-required">Status</label>
                    <select
                      className="form-select"
                      value={form.healthCheckStatus}
                      onChange={(e) => setForm({ ...form, healthCheckStatus: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_MAP[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Observations</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Any observations about the horse's condition..."
                      value={form.observations}
                      onChange={(e) => setForm({ ...form, observations: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="primary-button">Submit Health Check</button>
                </form>
              )}

              {loading ? (
                <p>Loading health checks...</p>
              ) : healthChecks.length === 0 ? (
                <p className="muted">No health checks recorded for this race yet.</p>
              ) : (
                <div className="check-list">
                  {healthChecks.map((check) => (
                    <div key={check.id} className="check-card">
                      <div className="check-header">
                        <strong>{check.horseName || check.horseId}</strong>
                        <span className={`badge badge--${check.status?.toLowerCase()}`}>
                          {check.status}
                        </span>
                      </div>
                      <p><strong>Referee:</strong> {check.refereeName || check.refereeId}</p>
                      {check.observations && <p><strong>Notes:</strong> {check.observations}</p>}
                      {check.verdict && <p><strong>Verdict:</strong> {check.verdict}</p>}
                      <p className="time">{new Date(check.checkedAt).toLocaleString()}</p>

                      {!check.approvedToRace && check.status === "Passed" && (
                        <div className="check-actions">
                          <button className="btn btn-accept" onClick={() => handleApprove(check.id)}>
                            Approve to Race
                          </button>
                          <button className="btn btn-reject" onClick={() => handleReject(check.id)}>
                            Reject
                          </button>
                        </div>
                      )}
                      {check.approvedToRace && (
                        <span className="badge badge--approved">Approved to Race</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default RefereeHealthCheckPage;
