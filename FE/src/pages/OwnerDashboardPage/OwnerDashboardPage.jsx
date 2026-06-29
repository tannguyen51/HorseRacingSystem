import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerProfile, getOwnerTournaments } from "../../services/ownerApi";
import "../OwnerSharedLayout.css";
import "./OwnerDashboardPage.css";

const upcomingRaces = [
  {
    title: "Trận Derby Bờ Biển",
    time: "22/5 · 4:20 CH",
    track: "Công viên Gulfstream",
    horse: "Sao Chổi Bạc",
  },
  {
    title: "Giải Mời Lục Bảo",
    time: "24/5 · 2:40 CH",
    track: "Emerald Downs",
    horse: "Tia Sét",
  },
  {
    title: "Dặm Vàng",
    time: "28/5 · 5:10 CH",
    track: "Santa Anita",
    horse: "Ngựa Nửa Đêm",
  },
];

const notifications = [
  {
    title: "Đã lên lịch kiểm tra sức khỏe",
    detail: "Tia Sét khám thú y vào 20/5.",
    time: "2 giờ trước",
  },
  {
    title: "Đăng ký đã được duyệt",
    detail: "Sao Chổi Bạc đã vào Trận Derby Bờ Biển.",
    time: "Hôm qua",
  },
  {
    title: "Kỵ sĩ đã xác nhận",
    detail: "Ariana Blake được chỉ định cho Ngựa Nửa Đêm.",
    time: "16/5",
  },
];

const activityFeed = [
  {
    title: "Đã đăng kết quả đua",
    detail: "Tia Sét về nhì trong Trình Diễn Mùa Xuân.",
    time: "14/5",
  },
  {
    title: "Cập nhật hiệu suất",
    detail: "Chỉ số tốc độ của Sao Chổi Bạc tăng lên 91.",
    time: "12/5",
  },
  {
    title: "Nhật ký huấn luyện",
    detail: "Ngựa Nửa Đêm hoàn thành buổi tập sức bền.",
    time: "11/5",
  },
];

const performanceSummary = [
  { label: "Tỷ lệ thắng", value: "38%" },
  { label: "Về đích top 3", value: "64%" },
  { label: "Tốc độ TB", value: "92" },
];

const quickActions = [
  {
    title: "Thêm ngựa mới",
    description: "Tải lên hồ sơ và theo dõi chỉ số hiệu suất.",
  },
  {
    title: "Đăng ký giải đấu",
    description: "Kiểm tra điều kiện và đặt chỗ.",
  },
  {
    title: "Xác nhận tham gia đua",
    description: "Phê duyệt tham gia cuộc đua sắp tới.",
  },
];

const chartData = [
  { label: "Tốc độ", value: 92 },
  { label: "Sức bền", value: 86 },
  { label: "Ổn định", value: 78 },
  { label: "Nước rút", value: 88 },
];

function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const profile = await getOwnerProfile();
        if (!cancelled) {
          setOwner(profile);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(error.message || "Không thể tải hồ sơ chủ ngựa.");
        }
      }

      try {
        const payload = await getOwnerTournaments();
        if (!cancelled) {
          setTournaments(Array.isArray(payload) ? payload.slice(0, 2) : []);
        }
      } catch {
        if (!cancelled) {
          setTournaments([]);
        }
      }
    };

    loadDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Tổng số ngựa",
        value: String(owner?.horseCount ?? 0),
        trend: owner?.ownerCode ?? "Hồ sơ chủ ngựa",
      },
      { label: "Cuộc đua đang diễn ra", value: "3", trend: "2 sắp diễn ra" },
      { label: "Tổng tiền thưởng", value: "$185,400", trend: "+12%" },
      { label: "Chờ xác nhận", value: "2", trend: "Đến hạn tuần này" },
    ],
    [owner],
  );

  const tournamentParticipation = tournaments.map((tournament) => ({
    id: tournament?.id ?? tournament?.Id,
    name: tournament?.name ?? tournament?.Name ?? "Giải đấu",
    races: `${tournament?.raceCount ?? tournament?.RaceCount ?? 0} cuộc đua`,
    status: (tournament?.isActive ?? tournament?.IsActive) ? "Mở" : "Đã đóng",
    rounds: `${tournament?.roundCount ?? tournament?.RoundCount ?? 0} vòng`,
  }));

  return (
    <div className="owner-page owner-dashboard">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Chủ Ngựa</p>
            <h3>Tổng quan chuồng ngựa</h3>
            <p className="muted">Theo dõi ngựa, đăng ký và phần thưởng.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Tài khoản chủ ngựa</p>
            <h4>{owner?.ownerCode ?? "Đang tải..."}</h4>
            <span>{owner?.email ?? "Đang tải hồ sơ"}</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Trạng thái hồ sơ</p>
            <h4>{owner?.status ?? "-"}</h4>
            <span>{owner?.ownerType ?? "Chủ ngựa"}</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="owner-hero">
            <div>
              <span className="pill">Bảng điều khiển</span>
              <h1>Chào mừng trở lại, {owner?.fullName || owner?.email || "Chủ ngựa"}</h1>
              <p>
                Quản lý chuồng ngựa, theo dõi đăng ký đua và giữ mọi ngựa
                sẵn sàng thi đấu.
              </p>
              {profileError ? <p className="form-error">{profileError}</p> : null}
              <div className="owner-hero__actions">
                <button className="primary-button" onClick={() => navigate("/owner/horses/new")}>Thêm ngựa</button>
                <button
                  className="ghost-button"
                  onClick={() => navigate("/owner/register-tournament")}
                >
                  Đăng ký giải đấu
                </button>
              </div>
            </div>
            <div className="owner-hero__panel">
              <div>
                <span>Ngựa sẵn sàng</span>
                <strong>{owner?.horseCount ?? 0}</strong>
              </div>
              <div>
                <span>Cuộc đua sắp tới</span>
                <strong>3</strong>
              </div>
              <div>
                <span>Chờ phê duyệt</span>
                <strong>2</strong>
              </div>
            </div>
          </section>

          <section className="owner-stats">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card hover-lift">
                <p className="muted">{stat.label}</p>
                <h3>{stat.value}</h3>
                <span className="stat-trend">{stat.trend}</span>
              </article>
            ))}
          </section>

          <section className="owner-columns">
            <div className="owner-stack">
              <div className="section-heading">
                <h2>Cuộc đua sắp tới</h2>
                <p>Xác nhận đăng ký và sắp xếp đội hình kỵ sĩ.</p>
              </div>
              <div className="owner-card-grid">
                {upcomingRaces.map((race) => (
                  <article
                    key={race.title}
                    className="owner-upcoming-card hover-lift"
                  >
                    <div className="owner-upcoming-card__header">
                      <span className="badge">Sắp diễn ra</span>
                      <span className="muted">{race.time}</span>
                    </div>
                    <h3>{race.title}</h3>
                    <p>{race.track}</p>
                    <div className="owner-upcoming-card__meta">
                      <span>Ngựa</span>
                      <strong>{race.horse}</strong>
                    </div>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Giải đấu gần đây</h2>
                <p>Theo dõi nơi ngựa của bạn đang tham gia.</p>
              </div>
              <div className="tournament-stack">
                {tournamentParticipation.map((item) => (
                  <article key={item.id} className="owner-tournament-card">
                    <div className="owner-tournament-card__header">
                      <span className="badge">{item.status}</span>
                      <span className="owner-prize">{item.rounds}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="muted">{item.races}</p>
                    <div className="owner-tournament-meta">
                      <span>Trạng thái giải đấu</span>
                      <strong>{item.status}</strong>
                    </div>
                  </article>
                ))}
                {tournamentParticipation.length === 0 ? (
                  <p className="muted">Không có giải đấu nào.</p>
                ) : null}
              </div>
            </div>

            <div className="owner-stack">
              <div className="section-heading">
                <h2>Thông báo</h2>
                <p>Cập nhật ưu tiên từ hoạt động chủ ngựa.</p>
              </div>
              <div className="notification-panel">
                {notifications.map((note) => (
                  <article key={note.title} className="notification-item">
                    <div>
                      <h4>{note.title}</h4>
                      <p>{note.detail}</p>
                    </div>
                    <span className="muted">{note.time}</span>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Hiệu suất ngựa</h2>
                <p>Tóm tắt hiệu suất 30 ngày qua.</p>
              </div>
              <div className="performance-card">
                <div className="performance-summary">
                  {performanceSummary.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="performance-chart">
                  {chartData.map((item) => (
                    <div key={item.label} className="chart-row">
                      <span>{item.label}</span>
                      <div className="chart-track">
                        <div
                          className="chart-fill"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="owner-section">
            <div className="section-heading">
              <h2>Hoạt động đua gần đây</h2>
              <p>Cập nhật mới nhất từ bảng tin hoạt động.</p>
            </div>
            <div className="activity-panel">
              {activityFeed.map((activity) => (
                <div key={activity.title} className="activity-item">
                  <div>
                    <h4>{activity.title}</h4>
                    <p>{activity.detail}</p>
                  </div>
                  <span className="muted">{activity.time}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="owner-section">
            <div className="section-heading">
              <h2>Thao tác nhanh</h2>
              <p>Truy cập nhanh các tác vụ thường dùng.</p>
            </div>
            <div className="quick-action-grid">
              {quickActions.map((action) => (
                <article key={action.title} className="quick-action-card">
                  <h4>{action.title}</h4>
                  <p className="muted">{action.description}</p>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      if (action.title === "Thêm ngựa mới") navigate("/owner/horses/new");
                      if (action.title === "Đăng ký giải đấu") navigate("/owner/register-tournament");
                      if (action.title === "Xác nhận tham gia đua") navigate("/owner/race-confirmations");
                    }}
                  >
                    Mở
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboardPage;
