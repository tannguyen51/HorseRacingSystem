import { useEffect, useMemo, useState } from "react";
import { confirmRaceEntry, getMyRaceEntries } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "./OwnerRaceConfirmationPage.css";

function OwnerRaceConfirmationPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyRaceEntries();
        const list = Array.isArray(data) ? data : [];
        const all = list.map((entry) => ({
          horseName: entry.horseName ?? entry.HorseName ?? "Không rõ",
          horseId: entry.horseId ?? entry.HorseId,
          entryId: entry.entryId ?? entry.EntryId ?? entry.id,
          raceId: entry.raceId ?? entry.RaceId,
          raceName: entry.raceName ?? entry.RaceName ?? entry.raceId ?? entry.RaceId,
          status: entry.status ?? entry.Status ?? "Pending",
        }));
        if (!ignore) setEntries(all);
      } catch (e) {
        if (!ignore) setMsg("Lỗi khi tải danh sách: " + e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const statusCounts = useMemo(
    () =>
      entries.reduce(
        (counts, entry) => ({
          ...counts,
          [entry.status]: (counts[entry.status] ?? 0) + 1,
        }),
        {},
      ),
    [entries],
  );

  const handleConfirm = async (raceId, entryId) => {
    try {
      await confirmRaceEntry(raceId, entryId);
      setMsg("Đã xác nhận đăng ký!");
      setEntries((prev) =>
        prev.map((e) =>
          e.entryId === entryId ? { ...e, status: "Confirmed" } : e,
        ),
      );
    } catch (e) {
      setMsg("Lỗi: " + e.message);
    }
  };

  return (
    <div className="owner-page owner-race-confirmation">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Chủ Ngựa</p>
            <h3>Xác nhận tham gia đua</h3>
            <p className="muted">Phê duyệt hoặc từ chối đăng ký sắp tới.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Chờ xác nhận</p>
            <h4>{statusCounts.Pending ?? 0} chờ xác nhận</h4>
            <span>Chờ chủ ngựa xử lý</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Đã xác nhận</p>
            <h4>{statusCounts.Confirmed ?? 0} đã xác nhận</h4>
            <span>Sẵn sàng tham gia</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Xác nhận tham gia đua</h1>
            <p>Xác nhận sự tham gia của ngựa trong các cuộc đua đã lên lịch.</p>
          </section>

          <section className="confirmation-summary">
            <article><span>Chờ xác nhận</span><strong>{statusCounts.Pending ?? 0}</strong><p>Cần quyết định</p></article>
            <article><span>Đã xác nhận</span><strong>{statusCounts.Confirmed ?? 0}</strong><p>Đã khóa tham gia</p></article>
            <article><span>Tổng</span><strong>{entries.length}</strong><p>Tổng số đăng ký</p></article>
          </section>

          <section className="confirmation-grid">
            {loading ? (
              <p>Đang tải danh sách...</p>
            ) : entries.length === 0 ? (
              <p className="muted">Không tìm thấy đăng ký đua nào. Hãy đăng ký ngựa vào giải đấu trước.</p>
            ) : (
              entries.map((entry) => (
                <article key={entry.entryId} className="confirmation-card">
                  <div className="confirmation-header">
                    <div>
                      <h3>{entry.horseName}</h3>
                      <p className="muted">Cuộc đua: {entry.raceName}</p>
                    </div>
                    <span className={`confirmation-status confirmation-status--${(entry.status || "pending").toLowerCase()}`}>
                      {entry.status || "Pending"}
                    </span>
                  </div>
                  <div className="confirmation-meta">
                    <div><span>Cổng</span><strong>{entry.gateNumber ?? "-"}</strong></div>
                    <div><span>Kỵ sĩ</span><strong>{entry.jockeyConfirmed ? "Đã xác nhận" : "Chờ duyệt"}</strong></div>
                  </div>
                  <div className="confirmation-actions">
                    <button
                      className="confirmation-action confirmation-action--confirm"
                      onClick={() => handleConfirm(entry.raceId, entry.entryId)}
                      disabled={entry.status === "Confirmed"}
                    >
                      Xác nhận tham gia
                    </button>
                  </div>
                </article>
              ))
            )}
            {msg && <p className={msg.startsWith("Lỗi") ? "form-error" : "form-success"}>{msg}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerRaceConfirmationPage;
