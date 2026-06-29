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
  DangerousBehavior: "Hành vi nguy hiểm",
  FalseStart: "Xuất phát sai",
  Interference: "Can thiệp",
  AnimalWelfare: "Phúc lợi động vật",
  EquipmentViolation: "Vi phạm thiết bị",
  Other: "Khác",
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
        if (!ignore) setError("Không thể tải phân công: " + e.message);
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
      setError("Không thể tải vi phạm: " + e.message);
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
      setError("Cuộc đua, Trọng tài và Mục tham gia là bắt buộc.");
      return;
    }
    if (!form.description.trim()) {
      setError("Mô tả là bắt buộc.");
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
      setSuccessMsg("Đã ghi nhận vi phạm thành công.");
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
            <p className="pill">Trọng tài</p>
            <h3>Vi phạm</h3>
            <p className="muted">Ghi nhận vi phạm cuộc đua.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Loại vi phạm</p>
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
              <span className="pill">Ngày đua</span>
              <h1>Hồ sơ vi phạm</h1>
              <p>Ghi nhận vi phạm quy tắc trong cuộc đua để duy trì cạnh tranh công bằng.</p>
            </div>
          </section>

          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success">{successMsg}</div>}

          <section className="referee-section">
            <div className="section-heading">
              <h2>Chọn cuộc đua</h2>
            </div>
            <select
              className="form-select"
              value={selectedRaceId}
              onChange={(e) => handleRaceSelect(e.target.value)}
            >
              <option value="">-- Chọn một cuộc đua --</option>
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
                <h2>Vi phạm</h2>
                <button className="primary-button" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Hủy" : "+ Ghi nhận vi phạm"}
                </button>
              </div>

              {showForm && (
                <form className="violation-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="label-required">Mục tham gia (Ngựa & Nài)</label>
                    <select
                      className="form-select"
                      value={form.raceEntryId}
                      onChange={(e) => setForm({ ...form, raceEntryId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn mục tham gia --</option>
                      {entries.map((entry) => (
                        <option key={entry.entryId} value={entry.entryId}>
                          {entry.horseName} {entry.jockeyName ? `- ${entry.jockeyName}` : ""}
                        </option>
                      ))}
                    </select>
                    {entries.length === 0 && (
                      <p className="muted">Không có mục tham gia nào trong cuộc đua này.</p>
                    )}
                    {selectedEntry && (
                      <p className="muted">Ngựa: {selectedEntry.horseName} | Nài: {selectedEntry.jockeyName || "Chưa phân công"}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-required">Loại vi phạm</label>
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
                    <label className="label-required">Mô tả</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Mô tả chi tiết vi phạm..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bằng chứng</label>
                    <input
                      className="form-input"
                      placeholder="URL hoặc mô tả bằng chứng"
                      value={form.evidence}
                      onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hình phạt</label>
                    <input
                      className="form-input"
                      placeholder="VD: Phạt thời gian, Truất quyền thi đấu"
                      value={form.penalty}
                      onChange={(e) => setForm({ ...form, penalty: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="primary-button">Ghi nhận vi phạm</button>
                </form>
              )}

              {loading ? (
                <p>Đang tải vi phạm...</p>
              ) : violations.length === 0 ? (
                <p className="muted">Chưa có vi phạm nào được ghi nhận cho cuộc đua này.</p>
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
                      {v.evidence && <p><strong>Bằng chứng:</strong> {v.evidence}</p>}
                      {v.penalty && <p><strong>Hình phạt:</strong> {v.penalty}</p>}
                      <p className="time">Đã ghi nhận: {new Date(v.recordedAt).toLocaleString()}</p>
                      {v.refereeName && <p className="muted">Bởi: {v.refereeName}</p>}
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
