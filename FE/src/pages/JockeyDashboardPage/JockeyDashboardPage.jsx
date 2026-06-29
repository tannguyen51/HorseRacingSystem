import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatJockeyDate,
  getJockeyAssignedRaces,
  getJockeyInvitations,
} from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyDashboardPage.css";

const fallbackRaces = [
  {
    id: "sample-race-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    tournamentName: "Summer Racing Cup",
    status: "Assigned",
    jockeyConfirmed: true,
    horseName: "Silver Comet",
    horseTotalRaces: 12,
    horseTotalWins: 4,
  },
  {
    id: "sample-race-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    tournamentName: "Elite Track Series",
    status: "Scheduled",
    jockeyConfirmed: true,
    horseName: "Midnight Runner",
    horseTotalRaces: 18,
    horseTotalWins: 6,
  },
];

function JockeyDashboardPage() {
  const [races, setRaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [raceData, invitationData] = await Promise.all([
          getJockeyAssignedRaces(),
          getJockeyInvitations(),
        ]);

        if (!cancelled) {
          setRaces(raceData);
          setInvitations(invitationData);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setInvitations([]);
          setErrorMessage(
            error.message || "Không thể tải dữ liệu bảng điều khiển.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRaces = useMemo(
    () =>
      [...races].sort((first, second) => {
        const firstTime = new Date(first.scheduledAt).getTime();
        const secondTime = new Date(second.scheduledAt).getTime();
        return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime);
      }),
    [races],
  );

  const nextRace = sortedRaces[0];
  const totalHorseRaces = races.reduce(
    (sum, race) => sum + Number(race.horseTotalRaces || 0),
    0,
  );
  const totalHorseWins = races.reduce(
    (sum, race) => sum + Number(race.horseTotalWins || 0),
    0,
  );
  const winRate =
    totalHorseRaces > 0 ? `${Math.round((totalHorseWins / totalHorseRaces) * 100)}%` : "0%";

  return (
    <div className="spectator-page jockey-dashboard">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Bảng Điều Khiển Nài Ngựa</p>
            <h3>Bảng điều khiển</h3>
            <p className="muted">Các cuộc đua được phân công, lời mời và trạng thái sẵn sàng.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Lịch tiếp theo</p>
            <h4>{nextRace?.title ?? "Chưa có cuộc đua"}</h4>
            <span>{formatJockeyDate(nextRace?.scheduledAt, "Đang chờ")}</span>
          </div>
          <div className="jockey-side-actions">
            <Link to="/jockey/invitations" className="jockey-side-link">
              Quản lý lời mời
            </Link>
            <Link to="/jockey/schedule" className="jockey-side-link">
              Mở lịch đua
            </Link>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-hero">
            <div>
              <span className="pill">Tổng quan kỵ sĩ</span>
              <h1>Bảng Điều Khiển Nài Ngựa</h1>
              <p>
                Xem các cuộc đua được phân công, theo dõi lịch trình sắp tới và
                giám sát hiệu suất trước ngày đua.
              </p>
              {errorMessage ? <p className="jockey-inline-warning">{errorMessage}</p> : null}
            </div>
            <div className="jockey-hero__panel">
              <div>
                <span>Cuộc đua được phân công</span>
                <strong>{loading ? "--" : races.length}</strong>
              </div>
              <div>
                <span>Lời mời đang chờ</span>
                <strong>{loading ? "--" : invitations.length}</strong>
              </div>
              <div>
                <span>Tổng kết chiến thắng</span>
                <strong>{winRate}</strong>
              </div>
            </div>
          </section>

          <section className="jockey-stat-grid">
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Cuộc đua được phân công</p>
              <h3>{races.length}</h3>
              <span>Danh sách cưỡi đã xác nhận</span>
            </article>
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Lịch sắp tới</p>
              <h3>{nextRace ? formatJockeyDate(nextRace.scheduledAt) : "Không có"}</h3>
              <span>{nextRace?.location ?? "Chưa đặt đường đua"}</span>
            </article>
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Tổng kết hiệu suất</p>
              <h3>{winRate}</h3>
              <span>{totalHorseWins} chiến thắng từ ngựa được phân công</span>
            </article>
          </section>

          <section className="jockey-dashboard-grid">
            <div className="jockey-panel">
              <div className="section-heading">
                <h2>Lịch Sắp Tới</h2>
                <p>Các cuộc đua được xác nhận gần nhất của bạn.</p>
              </div>
              <div className="jockey-list">
                {sortedRaces.slice(0, 4).map((race) => (
                  <article key={race.id} className="jockey-list-item">
                    <div>
                      <span className="badge">{race.status}</span>
                      <h3>{race.title}</h3>
                      <p className="muted">{race.tournamentName}</p>
                    </div>
                    <div className="jockey-list-item__meta">
                      <strong>{formatJockeyDate(race.scheduledAt)}</strong>
                      <span>{race.location}</span>
                      <span>Ngựa: {race.horseName}</span>
                    </div>
                  </article>
                ))}
                {!loading && sortedRaces.length === 0 ? (
                  <p className="muted">Chưa có cuộc đua nào được phân công.</p>
                ) : null}
              </div>
            </div>

            <div className="jockey-panel">
              <div className="section-heading">
                <h2>Quản Lý Lời Mời</h2>
                <p>Các đề nghị đua đang chờ phản hồi của bạn.</p>
              </div>
              <div className="jockey-list">
                {invitations.slice(0, 3).map((invitation) => (
                  <article key={invitation.id} className="jockey-list-item">
                    <div>
                      <span className="badge">{invitation.status}</span>
                      <h3>{invitation.raceName}</h3>
                      <p className="muted">Ngựa: {invitation.horseName}</p>
                    </div>
                    <Link
                      to={`/jockey/invitations/${invitation.id}`}
                      className="jockey-text-link"
                    >
                      Xem chi tiết
                    </Link>
                  </article>
                ))}
                {!loading && invitations.length === 0 ? (
                  <p className="muted">Không có lời mời đang chờ.</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeyDashboardPage;
