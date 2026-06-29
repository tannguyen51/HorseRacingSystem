import { useEffect, useMemo, useState } from "react";
import { formatJockeyDate, getJockeyAssignedRaces } from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyPerformancePage.css";

const fallbackRaces = [
  {
    id: "sample-performance-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    horseName: "Silver Comet",
    horseTotalRaces: 12,
    horseTotalWins: 4,
    status: "Assigned",
  },
  {
    id: "sample-performance-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    horseName: "Midnight Runner",
    horseTotalRaces: 18,
    horseTotalWins: 6,
    status: "Scheduled",
  },
];

export function JockeyPerformancePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPerformance = async () => {
      try {
        setLoading(true);
        const data = await getJockeyAssignedRaces();
        if (!cancelled) {
          setRaces(data);
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setMessage(error.message || "Không thể tải dữ liệu hiệu suất.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPerformance();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const assignedRaces = races.length;
    const confirmed = races.filter((race) => race.jockeyConfirmed).length;
    const horseStarts = races.reduce(
      (sum, race) => sum + Number(race.horseTotalRaces || 0),
      0,
    );
    const horseWins = races.reduce(
      (sum, race) => sum + Number(race.horseTotalWins || 0),
      0,
    );
    const winRate =
      horseStarts > 0 ? `${Math.round((horseWins / horseStarts) * 100)}%` : "0%";

    return { assignedRaces, confirmed, horseStarts, horseWins, winRate };
  }, [races]);

  return (
    <div className="spectator-page jockey-performance">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Hiệu Suất</p>
            <h3>Tổng quan kỵ sĩ</h3>
            <p className="muted">Xem hiệu suất từ các phân công hiện tại.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Ngựa được phân công</p>
            <h4>{loading ? "Đang tải..." : summary.assignedRaces}</h4>
            <span>{summary.confirmed} đã xác nhận</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-performance-header">
            <div>
              <span className="pill">Tổng Kết Hiệu Suất</span>
              <h1>Hiệu Suất Nài Ngựa</h1>
              <p>
                Theo dõi số lượng phân công, lịch sử chiến thắng của ngựa và
                mức độ sẵn sàng đua từ lịch trình hiện tại.
              </p>
              {message ? <p className="jockey-performance-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-performance-stats">
            <article className="jockey-performance-stat">
              <span>Cuộc đua được phân công</span>
              <strong>{summary.assignedRaces}</strong>
              <p className="muted">Hàng đợi cưỡi hiện tại</p>
            </article>
            <article className="jockey-performance-stat">
              <span>Các cuộc cưỡi đã xác nhận</span>
              <strong>{summary.confirmed}</strong>
              <p className="muted">Các mục đã được kỵ sĩ xác nhận</p>
            </article>
            <article className="jockey-performance-stat">
              <span>Tỷ lệ thắng ngựa cưỡi</span>
              <strong>{summary.winRate}</strong>
              <p className="muted">{summary.horseWins} thắng / {summary.horseStarts} lần đua</p>
            </article>
          </section>

          <section className="jockey-performance-panel">
            <div className="section-heading">
              <h2>Hiệu Suất Ngựa Được Phân Công</h2>
              <p>Tổng kết thành tích ngựa cho mỗi cuộc đua hiện được phân công cho bạn.</p>
            </div>
            <div className="jockey-performance-table">
              <div className="jockey-performance-row jockey-performance-row--head">
                <span>Cuộc đua</span>
                <span>Ngựa</span>
                <span>Lịch</span>
                <span>Thành Tích Ngựa</span>
                <span>Trạng thái</span>
              </div>
              {races.map((race) => (
                <div key={race.id} className="jockey-performance-row">
                  <span>
                    <strong>{race.title}</strong>
                    <small>{race.location}</small>
                  </span>
                  <span>{race.horseName}</span>
                  <span>{formatJockeyDate(race.scheduledAt)}</span>
                  <span>
                    {race.horseTotalWins || 0} thắng / {race.horseTotalRaces || 0} lần đua
                  </span>
                  <span className="badge">{race.status}</span>
                </div>
              ))}
              {!loading && races.length === 0 ? (
                <p className="muted">Chưa có dữ liệu hiệu suất.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeyPerformancePage;
