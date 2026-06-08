import { useState, useEffect } from "react";
import {
  getRaceViolations,
  recordViolation,
  getRaceEntries,
} from "../../services/refereeApi";
import { getMyAssignments } from "../../services/refereeAssignmentApi";
import "../RefereeSharedLayout.css";
import "./RefereeViolationPage.css";

const VIOLATION_TYPES = [
  "DangerousBehavior",
  "FalseStart",
  "Interference",
  "AnimalWelfare",
  "EquipmentViolation",
  "Other",
];

const TYPE_LABELS = {
  DangerousBehavior: "Dangerous Behavior",
  FalseStart: "False Start",
  Interference: "Interference",
  AnimalWelfare: "Animal Welfare",
  EquipmentViolation: "Equipment Violation",
  Other: "Other",
};

function RefereeViolationPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [violations, setViolations] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    raceEntryId: "",
    refereeId: "",
    violationType: "Interference",
    description: "",
    evidence: "",
    penalty: "",
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

  const loadViolations = async (raceId) => {
    setLoading(true);
    setError("");
    try {
      const data = await getRaceViolations(raceId);
      setViolations(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load violations: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceSelect = (raceId) => {
    setSelectedRaceId(raceId);
    setEntries([]);
    if (raceId) {
      loadViolations(raceId);
      const assignment = assignments.find((a) => a.raceId === raceId);
      setForm((f) => ({
        ...f,
        raceEntryId: "",
        refereeId: assignment?.refereeId || "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.raceEntryId || !form.refereeId || !selectedRaceId) {
      setError("Race, Referee, and Race Entry are required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      await recordViolation({
        raceId: selectedRaceId,
        raceEntryId: form.raceEntryId,
        refereeId: form.refereeId,
        violationType: form.violationType,
        description: form.description,
        evidence: form.evidence || undefined,
        penalty: form.penalty || undefined,
      });
      setSuccessMsg("Violation recorded successfully.");
      setShowForm(false);
      setForm((f) => ({
        ...f,
        raceEntryId: "",
        violationType: "Interference",
        description: "",
        evidence: "",
        penalty: "",
      }));
      loadViolations(selectedRaceId);
    } catch (e) {
      setError(e.message);
    }
  };

  const assignedRaces = [...new Map(assignments.map((a) => [a.raceId, a])).values()];

  const selectedEntry = entries.find((e) => e.entryId === form.raceEntryId);

  return (
    <div className="referee-page referee-violations">
      <div className="referee-layout">
        <aside className="referee-sidebar">
          <div className="referee-sidebar__header">
            <p className="pill">Referee</p>
            <h3>Violations</h3>
            <p className="muted">Record race violations.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Violation Types</p>
            <ul className="side-list">
              {VIOLATION_TYPES.map((t) => (
                <li key={t}>{TYPE_LABELS[t]}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Race Day</span>
              <h1>Violation Records</h1>
              <p>Document rule violations during races to maintain fair competition.</p>
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
                <h2>Violations</h2>
                <button className="primary-button" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Cancel" : "+ Record Violation"}
                </button>
              </div>

              {showForm && (
                <form className="violation-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="label-required">Race Entry (Horse & Jockey)</label>
                    <select
                      className="form-select"
                      value={form.raceEntryId}
                      onChange={(e) => setForm({ ...form, raceEntryId: e.target.value })}
                      required
                    >
                      <option value="">-- Select an entry --</option>
                      {entries.map((entry) => (
                        <option key={entry.entryId} value={entry.entryId}>
                          {entry.horseName} {entry.jockeyName ? `- ${entry.jockeyName}` : ""}
                        </option>
                      ))}
                    </select>
                    {entries.length === 0 && (
                      <p className="muted">No entries in this race.</p>
                    )}
                    {selectedEntry && (
                      <p className="muted">Horse: {selectedEntry.horseName} | Jockey: {selectedEntry.jockeyName || "Unassigned"}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-required">Violation Type</label>
                    <select
                      className="form-select"
                      value={form.violationType}
                      onChange={(e) => setForm({ ...form, violationType: e.target.value })}
                    >
                      {VIOLATION_TYPES.map((t) => (
                        <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label-required">Description</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe the violation in detail..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Evidence</label>
                    <input
                      className="form-input"
                      placeholder="URL or description of evidence"
                      value={form.evidence}
                      onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Penalty</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Time penalty, Disqualification"
                      value={form.penalty}
                      onChange={(e) => setForm({ ...form, penalty: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="primary-button">Record Violation</button>
                </form>
              )}

              {loading ? (
                <p>Loading violations...</p>
              ) : violations.length === 0 ? (
                <p className="muted">No violations recorded for this race yet.</p>
              ) : (
                <div className="violation-list">
                  {violations.map((v) => (
                    <div key={v.id} className="violation-card">
                      <div className="violation-header">
                        <strong>{v.horseName || v.raceEntryId}</strong>
                        <span className={`badge badge--${v.violationType?.toLowerCase()}`}>
                          {TYPE_LABELS[v.violationType] || v.violationType}
                        </span>
                      </div>
                      <p>{v.description}</p>
                      {v.evidence && <p><strong>Evidence:</strong> {v.evidence}</p>}
                      {v.penalty && <p><strong>Penalty:</strong> {v.penalty}</p>}
                      <p className="time">Recorded: {new Date(v.recordedAt).toLocaleString()}</p>
                      {v.refereeName && <p className="muted">By: {v.refereeName}</p>}
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

export default RefereeViolationPage;
