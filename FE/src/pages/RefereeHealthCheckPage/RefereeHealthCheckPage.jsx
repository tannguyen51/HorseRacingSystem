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
  Passed: "Đạt",
  Failed: "Không đạt",
  RequiresRecheck: "Cần kiểm tra lại",
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

  const loadHealthChecks = async (raceId) => {
    setLoading(true);
    setError("");
    try {
      const data = await getRaceHealthChecks(raceId);
      setHealthChecks(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Không thể tải kiểm tra sức khỏe: " + e.message);
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
      setError("Tất cả các trường là bắt buộc.");
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
      setSuccessMsg("Đã tạo kiểm tra sức khỏe thành công.");
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
    const reason = prompt("Nhập lý do từ chối:");
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
            <p className="pill">Trọng tài</p>
            <h3>Kiểm tra sức khỏe</h3>
            <p className="muted">Kiểm tra ngựa trước cuộc đua.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Cuộc đua được phân công</p>
            <h4>{assignments.length} cuộc đua</h4>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Ngày đua</span>
              <h1>Kiểm tra sức khỏe ngựa</h1>
              <p>Kiểm tra ngựa trước mỗi cuộc đua để đảm bảo chúng đủ điều kiện thi đấu.</p>
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
                <h2>Kiểm tra sức khỏe</h2>
                <button className="primary-button" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "Hủy" : "+ Kiểm tra mới"}
                </button>
              </div>

              {showForm && (
                <form className="health-check-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="label-required">Ngựa</label>
                    <select
                      className="form-select"
                      value={form.horseId}
                      onChange={(e) => setForm({ ...form, horseId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn ngựa --</option>
                      {entries.map((entry) => (
                        <option key={entry.horseId} value={entry.horseId}>
                          {entry.horseName} {entry.jockeyName ? `(Nài: ${entry.jockeyName})` : ""}
                        </option>
                      ))}
                    </select>
                    {entries.length === 0 && (
                      <p className="muted">Không có ngựa nào được phân công cho cuộc đua này. Hãy phân công ngựa trong Admin trước.</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="label-required">Trạng thái</label>
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
                    <label>Quan sát</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Bất kỳ quan sát nào về tình trạng của ngựa..."
                      value={form.observations}
                      onChange={(e) => setForm({ ...form, observations: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="primary-button">Gửi kiểm tra sức khỏe</button>
                </form>
              )}

              {loading ? (
                <p>Đang tải kiểm tra sức khỏe...</p>
              ) : healthChecks.length === 0 ? (
                <p className="muted">Chưa có kiểm tra sức khỏe nào cho cuộc đua này.</p>
              ) : (
                <div className="check-list">
                  {healthChecks.map((check) => (
                    <div key={check.id} className="check-card">
                      <div className="check-header">
                        <strong>{check.horseName || check.horseId}</strong>
                        <span className={`badge badge--${check.status?.toLowerCase()}`}>
                          {STATUS_MAP[check.status] || check.status}
                        </span>
                      </div>
                      <p><strong>Trọng tài:</strong> {check.refereeName || check.refereeId}</p>
                      {check.observations && <p><strong>Ghi chú:</strong> {check.observations}</p>}
                      {check.verdict && <p><strong>Phán quyết:</strong> {check.verdict}</p>}
                      <p className="time">{new Date(check.checkedAt).toLocaleString()}</p>

                      {!check.approvedToRace && check.status === "Passed" && (
                        <div className="check-actions">
                          <button className="btn btn-accept" onClick={() => handleApprove(check.id)}>
                            Phê duyệt thi đấu
                          </button>
                          <button className="btn btn-reject" onClick={() => handleReject(check.id)}>
                            Từ chối
                          </button>
                        </div>
                      )}
                      {check.approvedToRace && (
                        <span className="badge badge--approved">Đã phê duyệt thi đấu</span>
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
