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
          gateNumber: entry.gateNumber ?? entry.GateNumber,
          jockeyConfirmed: entry.jockeyConfirmed ?? entry.JockeyConfirmed,
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
    () => entries.reduce((counts, e) => ({ ...counts, [e.status]: (counts[e.status] ?? 0) + 1 }), {}),
    [entries],
  );

  const handleConfirm = async (raceId, entryId) => {
    try {
      await confirmRaceEntry(raceId, entryId);
      setMsg("Đã xác nhận đăng ký!");
      setEntries((prev) => prev.map((e) => e.entryId === entryId ? { ...e, status: "Confirmed" } : e));
    } catch (e) {
      setMsg("Lỗi: " + e.message);
    }
  };

  const nextRace = useMemo(() => {
    if (entries.length === 0) return null;
    return entries[0];
  }, [entries]);

  // Top horses from entries (tính số lần mỗi ngựa xuất hiện)
  const topHorses = useMemo(() => {
    const counts = {};
    entries.forEach(e => {
      counts[e.horseName] = (counts[e.horseName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

  return (
    <div className="orc-page">
      {/* Hero */}
      <section className="orc-hero" style={{ backgroundImage: "url('/src/assets/racing.png')" }}>
        <div className="orc-hero__overlay" />
        <div className="orc-hero__content">
          <div>
            <span className="pill" style={{ background: "rgba(215,170,77,0.2)", color: "#f2d28b" }}>Xác nhận đua</span>
            <h1>Xác nhận tham gia cuộc đua</h1>
            <p>Xác nhận sự tham gia của ngựa trong các cuộc đua đã lên lịch.</p>
          </div>
          <div className="orc-hero__stats">
            <div>
              <span>Chờ xác nhận</span>
              <strong>{statusCounts.Pending ?? 0}</strong>
            </div>
            <div>
              <span>Đã xác nhận</span>
              <strong>{statusCounts.Confirmed ?? 0}</strong>
            </div>
            <div>
              <span>Tổng số</span>
              <strong>{entries.length}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Layout 2 cột */}
      <div className="orc-layout">
        {/* Main */}
        <div className="orc-main">
          {msg && <p className={msg.startsWith("Lỗi") ? "form-error" : "form-success"}>{msg}</p>}

          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: 40 }}>Đang tải...</p>
          ) : entries.length === 0 ? (
            <div className="orc-empty">
              <p className="muted">Không tìm thấy đăng ký đua nào.</p>
            </div>
          ) : (
            <div className="orc-grid">
              {entries.map((entry) => (
                <article key={entry.entryId} className="orc-card">
                  <div className="orc-card__top">
                    <div>
                      <h3>{entry.horseName}</h3>
                      <p className="muted">{entry.raceName}</p>
                    </div>
                    <span className={`orc-badge orc-badge--${(entry.status || "pending").toLowerCase()}`}>
                      {entry.status === "Confirmed" ? "Đã xác nhận" : entry.status === "Pending" ? "Chờ xác nhận" : entry.status}
                    </span>
                  </div>
                  <div className="orc-card__meta">
                    <div><span>Cổng</span><strong>{entry.gateNumber ?? "--"}</strong></div>
                    <div><span>Kỵ sĩ</span><strong>{entry.jockeyConfirmed ? "Đã nhận" : "Chờ"}</strong></div>
                  </div>
                  <button
                    className="orc-btn"
                    onClick={() => handleConfirm(entry.raceId, entry.entryId)}
                    disabled={entry.status === "Confirmed"}
                  >
                    {entry.status === "Confirmed" ? "✓ Đã xác nhận" : "Xác nhận tham gia"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="orc-sidebar">
          {/* Next Race */}
          {nextRace && (
            <div className="orc-widget">
              <h4>Cuộc đua tiếp theo</h4>
              <div className="orc-widget__race">
                <h5>{nextRace.raceName}</h5>
                <p className="muted">Ngựa: {nextRace.horseName}</p>
              </div>
            </div>
          )}

          {/* Top Horses */}
          {topHorses.length > 0 && (
            <div className="orc-widget">
              <h4>Ngựa tham gia nhiều nhất</h4>
              <div className="orc-top-horses">
                {topHorses.map((h, i) => (
                  <div key={h.name} className="orc-top-horse">
                    <span className="orc-top-rank">#{i + 1}</span>
                    <span className="orc-top-name">{h.name}</span>
                    <span className="orc-top-wins">{h.count} lần</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default OwnerRaceConfirmationPage;
