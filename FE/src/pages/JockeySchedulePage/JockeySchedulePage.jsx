import { useEffect, useMemo, useState } from "react";
import { formatJockeyDate, getJockeyAssignedRaces } from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeySchedulePage.css";

const fallbackRaces = [
  {
    id: "sample-race-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    tournamentName: "Summer Racing Cup",
    status: "Assigned",
    jockeyConfirmed: true,
    ownerConfirmed: true,
    horseName: "Silver Comet",
    horseBreed: "Thoroughbred",
    horseGender: "Female",
    horseAge: 4,
    horseWeight: 462,
    horseHeight: 161,
    horseTotalRaces: 12,
    horseTotalWins: 4,
    distance: 1600,
    maxParticipants: 12,
  },
  {
    id: "sample-race-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    tournamentName: "Elite Track Series",
    status: "Scheduled",
    jockeyConfirmed: true,
    ownerConfirmed: false,
    horseName: "Midnight Runner",
    horseBreed: "Arabian",
    horseGender: "Male",
    horseAge: 5,
    horseWeight: 470,
    horseHeight: 164,
    horseTotalRaces: 18,
    horseTotalWins: 6,
    distance: 2000,
    maxParticipants: 10,
  },
];

function InfoRow({ label, value }) {
  return (
    <div className="jockey-schedule-info-row">
      <span>{label}</span>
      <strong>{value || "Chưa xác định"}</strong>
    </div>
  );
}

export function JockeySchedulePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const [detailMode, setDetailMode] = useState("race");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRaces = async () => {
      try {
        setLoading(true);
        const data = await getJockeyAssignedRaces();
        if (!cancelled) {
          setRaces(data);
          setSelectedRace(data[0] ?? null);
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setSelectedRace(fallbackRaces[0]);
          setMessage(error.message || "Không thể tải các cuộc đua được phân công.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRaces();
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

  const calendarGroups = useMemo(() => {
    return sortedRaces.reduce((groups, race) => {
      const rawDate = new Date(race.scheduledAt);
      const key = Number.isNaN(rawDate.getTime())
        ? "Ngày chưa xác định"
        : new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }).format(rawDate);
      return {
        ...groups,
        [key]: [...(groups[key] ?? []), race],
      };
    }, {});
  }, [sortedRaces]);

  const openDetail = (race, mode) => {
    setSelectedRace(race);
    setDetailMode(mode);
  };

  return (
    <div className="spectator-page jockey-schedule">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Lịch Đua</p>
            <h3>Các cuộc cưỡi được phân công</h3>
            <p className="muted">Xem thông tin ngựa và thông tin cuộc đua.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Cuộc đua tiếp theo</p>
            <h4>{sortedRaces[0]?.title ?? "Chưa đặt"}</h4>
            <span>{formatJockeyDate(sortedRaces[0]?.scheduledAt, "Đang chờ")}</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-schedule-header">
            <div>
              <span className="pill">Cuộc Đua Được Phân Công</span>
              <h1>Lịch Đua</h1>
              <p>
                Theo dõi các phân công đã xác nhận, kiểm tra chi tiết cuộc đua
                và xem hồ sơ ngựa cho mỗi lần cưỡi.
              </p>
              {message ? <p className="jockey-schedule-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-schedule-layout">
            <div className="jockey-schedule-main">
              <div className="section-heading">
                <h2>Cuộc Đua Được Phân Công</h2>
                <p>Mỗi phân công bao gồm thẻ đua và ngựa được chỉ định.</p>
              </div>

              {loading ? (
                <div className="jockey-schedule-loading">
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line" />
                </div>
              ) : sortedRaces.length === 0 ? (
                <div className="jockey-schedule-empty">
                  <h3>Không có cuộc đua được phân công</h3>
                  <p className="muted">Lời mời đã chấp nhận sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                <div className="jockey-race-card-list">
                  {sortedRaces.map((race) => (
                    <article
                      key={race.id}
                      className={`jockey-race-card ${selectedRace?.id === race.id ? "jockey-race-card--active" : ""}`}
                    >
                      <div className="jockey-race-card__content">
                        <span className="badge">{race.status}</span>
                        <h3>{race.title}</h3>
                        <p className="muted">{race.tournamentName}</p>
                        <div className="jockey-race-card__meta">
                          <span>{formatJockeyDate(race.scheduledAt)}</span>
                          <span>{race.location}</span>
                          <span>{race.distance ? `${race.distance}m` : "Cự ly chưa xác định"}</span>
                        </div>
                      </div>
                      <div className="jockey-race-card__horse">
                        <span>Ngựa</span>
                        <strong>{race.horseName}</strong>
                        <p className="muted">
                          {race.jockeyConfirmed ? "Kỵ sĩ đã xác nhận" : "Đang chờ xác nhận"}
                        </p>
                      </div>
                      <div className="jockey-race-card__actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => openDetail(race, "horse")}
                        >
                          Xem Thông Tin Ngựa
                        </button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => openDetail(race, "race")}
                        >
                          Xem Thông Tin Cuộc Đua
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="jockey-schedule-detail">
              <div className="jockey-detail-tabs">
                <button
                  type="button"
                  className={detailMode === "race" ? "active" : ""}
                  onClick={() => setDetailMode("race")}
                >
                  Thông Tin Cuộc Đua
                </button>
                <button
                  type="button"
                  className={detailMode === "horse" ? "active" : ""}
                  onClick={() => setDetailMode("horse")}
                >
                  Thông Tin Ngựa
                </button>
              </div>

              {!selectedRace ? (
                <p className="muted">Chọn một cuộc đua được phân công để xem chi tiết.</p>
              ) : detailMode === "race" ? (
                <div className="jockey-schedule-detail__body">
                  <div className="section-heading">
                    <h2>{selectedRace.title}</h2>
                    <p>{selectedRace.tournamentName}</p>
                  </div>
                  <InfoRow label="Thời gian dự kiến" value={formatJockeyDate(selectedRace.scheduledAt)} />
                  <InfoRow label="Đường đua" value={selectedRace.location} />
                  <InfoRow label="Trạng thái" value={selectedRace.status} />
                  <InfoRow label="Cự ly" value={selectedRace.distance ? `${selectedRace.distance}m` : ""} />
                  <InfoRow label="Số người tham gia" value={selectedRace.maxParticipants} />
                  <InfoRow label="Chủ ngựa đã xác nhận" value={selectedRace.ownerConfirmed ? "Có" : "Không"} />
                </div>
              ) : (
                <div className="jockey-schedule-detail__body">
                  <div className="section-heading">
                    <h2>{selectedRace.horseName}</h2>
                    <p>Hồ sơ ngựa được phân công.</p>
                  </div>
                  <InfoRow label="Giống" value={selectedRace.horseBreed} />
                  <InfoRow label="Giới tính" value={selectedRace.horseGender} />
                  <InfoRow label="Tuổi" value={selectedRace.horseAge} />
                  <InfoRow label="Cân nặng" value={selectedRace.horseWeight} />
                  <InfoRow label="Chiều cao" value={selectedRace.horseHeight} />
                  <InfoRow label="Sự nghiệp" value={`${selectedRace.horseTotalWins || 0} thắng / ${selectedRace.horseTotalRaces || 0} lần đua`} />
                </div>
              )}
            </aside>
          </section>

          <section className="jockey-calendar-panel">
            <div className="section-heading">
              <h2>Lịch Đua</h2>
              <p>Nhóm lịch cho tất cả các ngày đua được phân công.</p>
            </div>
            <div className="jockey-calendar-list">
              {Object.entries(calendarGroups).map(([date, items]) => (
                <article key={date} className="jockey-calendar-day">
                  <h3>{date}</h3>
                  <div>
                    {items.map((race) => (
                      <button
                        key={race.id}
                        type="button"
                        onClick={() => openDetail(race, "race")}
                      >
                        <strong>{race.title}</strong>
                        <span>{race.location}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {!loading && Object.keys(calendarGroups).length === 0 ? (
                <p className="muted">Chưa có mục lịch nào.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeySchedulePage;
