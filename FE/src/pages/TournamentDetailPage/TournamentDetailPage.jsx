import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTournament, getRoundsByTournament, getRaceEntries } from "../../services/spectatorApi";
import { getTournamentRaces } from "../../services/adminApi";
import "./TournamentDetailPage.css";

function TournamentDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [races, setRaces] = useState([]);
  const [entriesMap, setEntriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRace, setExpandedRace] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const t = await getTournament(id);
        if (cancelled) return;
        setTournament(t);

        const r = await getRoundsByTournament(id);
        const roundsList = Array.isArray(r) ? r : [];
        if (cancelled) return;
        setRounds(roundsList);

        const racesList = await getTournamentRaces(id);
        const list = Array.isArray(racesList) ? racesList : [];
        if (cancelled) return;
        setRaces(list);
      } catch { /* empty */ }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const loadEntries = async (raceId) => {
    if (entriesMap[raceId]) {
      setExpandedRace(expandedRace === raceId ? null : raceId);
      return;
    }
    try {
      const entries = await getRaceEntries(raceId);
      setEntriesMap(prev => ({ ...prev, [raceId]: Array.isArray(entries) ? entries : [] }));
      setExpandedRace(raceId);
    } catch { /* empty */ }
  };

  if (loading) return <div className="page" style={{ textAlign: "center", padding: 60, color: "#657086" }}>Đang tải...</div>;
  if (!tournament) return <div className="page" style={{ textAlign: "center", padding: 60, color: "#657086" }}>Không tìm thấy giải đấu.</div>;

  const image = tournament.imageUrl ?? tournament.ImageUrl;
  const active = tournament.isActive ?? tournament.IsActive;
  const statusLabel = active ? "Đang hoạt động" : "Không hoạt động";

  return (
    <div className="tournament-detail-page" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 0" }}>
      {/* Banner */}
      <div style={{
        borderRadius: 20, overflow: "hidden", marginBottom: 24,
        minHeight: 180, position: "relative",
        background: image
          ? `url(${image}) center/cover no-repeat`
          : "linear-gradient(135deg, rgba(231,198,120,0.2), rgba(143,100,32,0.1))",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          display: "flex", alignItems: "flex-end", padding: 24
        }}>
          <div>
            <span style={{
              display: "inline-block", padding: "4px 12px", borderRadius: 999,
              fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
              background: active ? "rgba(22,101,52,0.2)" : "rgba(101,112,134,0.2)",
              color: active ? "#4ade80" : "#94a3b8"
            }}>{statusLabel}</span>
            <h1 style={{ color: "#fff", fontSize: 32, margin: "8px 0 4px" }}>{tournament.name ?? tournament.Name}</h1>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="detail-grid" style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 24
      }}>
        <InfoCard label="Hạng mục" value={tournament.category ?? tournament.Category ?? "-"} />
        <InfoCard label="Địa điểm" value={tournament.venue ?? tournament.Venue ?? "-"} />
        <InfoCard label="Quốc gia" value={tournament.country ?? tournament.Country ?? "-"} />
        <InfoCard label="Bắt đầu" value={fmtDate(tournament.startDate ?? tournament.StartDate)} />
        <InfoCard label="Kết thúc" value={fmtDate(tournament.endDate ?? tournament.EndDate)} />
        <InfoCard label="Vòng đấu" value={rounds.length.toString()} />
        <InfoCard label="Cuộc đua" value={races.length.toString()} />
        <InfoCard label="Giải thưởng" value={`${(tournament.prizePool ?? tournament.PrizePool ?? 0).toLocaleString()} USD`} />
      </div>

      {/* Description */}
      {(tournament.description ?? tournament.Description) && (
        <p style={{ color: "#657086", lineHeight: 1.7, marginBottom: 32 }}>
          {tournament.description ?? tournament.Description}
        </p>
      )}

      {/* Races */}
      <h2 style={{ color: "#172033", marginBottom: 16 }}>Danh sách cuộc đua</h2>
      {races.length === 0 ? (
        <p style={{ color: "#657086" }}>Chưa có cuộc đua nào.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {races.map((race) => {
            const raceId = race.id ?? race.Id;
            const status = race.status ?? race.Status;
            const entries = entriesMap[raceId] || [];
            const isExpanded = expandedRace === raceId;

            return (
              <div key={raceId} style={{
                border: "1px solid rgba(143,100,32,0.16)", borderRadius: 14,
                background: "rgba(255,250,240,0.96)", overflow: "hidden"
              }}>
                <button
                  onClick={() => loadEntries(raceId)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 16, padding: 20,
                    border: "none", background: "none", cursor: "pointer", textAlign: "left",
                    fontFamily: "inherit"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, fontSize: 17, color: "#172033" }}>{race.name ?? race.Name}</h3>
                      <span style={{
                        padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                        background: statusBg(status), color: statusColor(status)
                      }}>{statusLabel_(status)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#657086" }}>
                      {fmtDate(race.scheduledAt ?? race.ScheduledAt)} · {(race.distance ?? race.Distance ?? 0)}m
                      · {race.location ?? race.Location ?? "Chưa có địa điểm"}
                      · {entries.length > 0 ? `${entries.length} ngựa` : `${race.entriesCount ?? race.EntriesCount ?? 0} ngựa`}
                    </p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                    style={{ color: "#657086", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(143,100,32,0.1)", padding: "16px 20px 20px" }}>
                    {entries.length === 0 ? (
                      <p style={{ color: "#657086", fontSize: 13 }}>Chưa có ngựa nào được phân công vào cuộc đua này.</p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr>
                            <th style={thStyle}>STT</th>
                            <th style={thStyle}>Ngựa</th>
                            <th style={thStyle}>Kỵ sĩ</th>
                            <th style={thStyle}>Tỉ lệ thắng</th>
                            <th style={thStyle}>Số trận</th>
                            <th style={thStyle}>Tỉ lệ cược</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((entry, idx) => {
                            const eId = entry.entryId ?? entry.EntryId ?? idx;
                            const horseName = entry.horseName ?? entry.HorseName ?? "-";
                            const jockeyName = entry.jockeyName ?? entry.JockeyName ?? "Chưa có";
                            const winRate = entry.horseWinRate ?? entry.HorseWinRate ?? 0;
                            const totalRaces = entry.horseTotalRaces ?? entry.HorseTotalRaces ?? 0;
                            const odds = entry.odds ?? entry.Odds ?? 1.0;
                            const oddColor = odds <= 2 ? "#166534" : odds <= 5 ? "#92400e" : "#c41e1e";
                            return (
                              <tr key={eId} style={{ borderBottom: "1px solid rgba(143,100,32,0.06)" }}>
                                <td style={tdStyle}>{idx + 1}</td>
                                <td style={{ ...tdStyle, fontWeight: 600, color: "#172033" }}>{horseName}</td>
                                <td style={tdStyle}>{jockeyName}</td>
                                <td style={tdStyle}>{winRate}%</td>
                                <td style={tdStyle}>{totalRaces}</td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: oddColor }}>
                                  {odds.toFixed(2)}x
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div style={{
      padding: 18, borderRadius: 14, border: "1px solid rgba(143,100,32,0.14)",
      background: "rgba(255,250,240,0.92)"
    }}>
      <span style={{ display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#657086", marginBottom: 6 }}>{label}</span>
      <strong style={{ fontSize: 17, color: "#172033" }}>{value}</strong>
    </div>
  );
}

const thStyle = { padding: "10px 14px", textAlign: "left", borderBottom: "2px solid rgba(143,100,32,0.12)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, color: "#657086" };
const tdStyle = { padding: "12px 14px", fontSize: 14, color: "#34415b" };

function fmtDate(v) {
  if (!v) return "-";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v));
}

function statusBg(s) {
  const m = { scheduled: "rgba(37,99,235,0.1)", inprogress: "rgba(245,158,11,0.1)", finished: "rgba(16,185,129,0.1)", cancelled: "rgba(239,68,68,0.1)", awaitingresult: "rgba(139,92,246,0.1)", resultpendingapproval: "rgba(245,158,11,0.1)" };
  return m[(s || "").toLowerCase()] || "rgba(100,116,139,0.1)";
}
function statusColor(s) {
  const m = { scheduled: "#2563eb", inprogress: "#f59e0b", finished: "#10b981", cancelled: "#ef4444", awaitingresult: "#8b5cf6", resultpendingapproval: "#f59e0b" };
  return m[(s || "").toLowerCase()] || "#64748b";
}
function statusLabel_(s) {
  const m = { scheduled: "Sắp diễn ra", inprogress: "Đang đua", finished: "Đã kết thúc", cancelled: "Đã hủy", awaitingresult: "Chờ kết quả", resultpendingapproval: "Chờ duyệt" };
  return m[(s || "").toLowerCase()] || s || "Không xác định";
}

export default TournamentDetailPage;
