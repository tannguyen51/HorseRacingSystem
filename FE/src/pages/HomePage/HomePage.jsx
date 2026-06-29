import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRaces } from "../../services/spectatorApi";
import { unwrapResponseData } from "../../services/authRoleUtils";
import heroImage from "../../assets/racing.png";
import homeOneImage from "../../assets/home1.png";
import homeTwoImage from "../../assets/home2.png";
import jockeyImage from "../../assets/Jockey.png";
import "./HomePage.css";

const STATS = [
  { value: "12+", label: "Giải Đấu Mỗi Mùa" },
  { value: "48+", label: "Cuộc Đua Hàng Năm" },
  { value: "200+", label: "Kỵ Sĩ Chuyên Nghiệp" },
  { value: "150+", label: "Chủ Ngựa" },
];

const TOURNAMENTS = [
  {
    name: "Spring Championship 2026",
    category: "Grade 1",
    venue: "Churchill Downs",
    races: 12,
    prize: "$250,000",
    status: "Đang diễn ra",
  },
  {
    name: "Summer Derby Series",
    category: "Grade 2",
    venue: "Belmont Park",
    races: 8,
    prize: "$180,000",
    status: "Sắp khai mạc",
  },
  {
    name: "Royal Ascot Cup",
    category: "Grade 1",
    venue: "Ascot Racecourse",
    races: 15,
    prize: "$500,000",
    status: "Đang diễn ra",
  },
];

const MARQUEE_IMAGES = [heroImage, homeOneImage, homeTwoImage, jockeyImage];

const TOP_JOCKEYS = [
  { name: "Marcus Chen", wins: 82, races: 340, winRate: "24.1%", rank: "#1" },
  { name: "Elena Rodriguez", wins: 48, races: 210, winRate: "22.9%", rank: "#2" },
  { name: "David Park", wins: 65, races: 280, winRate: "23.2%", rank: "#3" },
];

const TOP_OWNERS = [
  { name: "John Whitfield", horses: 3, wins: 14, entries: 36, rank: "#1" },
  { name: "Sarah O'Brien", horses: 3, wins: 15, entries: 34, rank: "#2" },
  { name: "Michael Torres", horses: 2, wins: 8, entries: 18, rank: "#3" },
];

const RECENT_RESULTS = [
  { race: "Opening Sprint", horse: "Silver Comet", jockey: "Marcus Chen", time: "1:11.24", position: 1 },
  { race: "Opening Sprint", horse: "Golden Arrow", jockey: "Elena Rodriguez", time: "1:11.89", position: 2 },
  { race: "Opening Sprint", horse: "Thunder Strike", jockey: "Marcus Chen", time: "1:12.45", position: 3 },
  { race: "Mid-Distance Classic", horse: "Storm Chaser", jockey: "Elena Rodriguez", time: "2:05.30", position: 1 },
];

function HomePage() {
  const [recentRaces, setRecentRaces] = useState([]);

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })
      : "Chưa xác định";

  useEffect(() => {
    getRaces()
      .then((res) => {
        const data = unwrapResponseData(res);
        const all = Array.isArray(data) ? data : [];
        const finished = all
          .filter((r) => (r.status ?? r.Status) === "Finished")
          .sort((a, b) => new Date(b.scheduledAt ?? b.ScheduledAt ?? 0) - new Date(a.scheduledAt ?? a.ScheduledAt ?? 0))
          .slice(0, 5);
        setRecentRaces(finished);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero Banner ── */}
      <section className="hero-banner">
        <div className="hero-banner__bg">
          <img src={heroImage} alt="" />
          <div className="hero-banner__overlay" />
        </div>
        <div className="hero-banner__content">
          <span className="hero-banner__badge">🏆 Nền Tảng Đua Ngựa Hàng Đầu</span>
          <h1>Chinh Phục Đường Đua<br />Cùng RaceMaster</h1>
          <p>
            Nền tảng toàn diện cho Chủ Ngựa, Kỵ Sĩ và Khán Giả — quản lý giải đấu,
            theo dõi kết quả trực tiếp và kết nối cộng đồng đua ngựa chuyên nghiệp.
          </p>
          <div className="hero-banner__actions">
            <Link to="/register" className="hero-btn hero-btn--primary">Tham Gia Ngay</Link>
            <Link to="/tournaments" className="hero-btn hero-btn--outline">Khám Phá Giải Đấu</Link>
          </div>
        </div>
      </section>

      {/* ── Thống kê hệ thống ── */}
      <section className="stats-bar">
        <div className="stats-bar__grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-item__value">{s.value}</span>
              <span className="stat-item__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Giải đấu nổi bật ── */}
      <section className="tournaments-section">
        <div className="section-header">
          <span className="section-tag">Giải Đấu</span>
          <h2>Giải Đấu Nổi Bật</h2>
          <p>Những giải đấu danh giá nhất đang chờ đón bạn và chiến mã của mình.</p>
        </div>
        <div className="tournaments-grid">
          {TOURNAMENTS.map((t) => (
            <div key={t.name} className="tournament-card">
              <div className="tournament-card__header">
                <span className={`tournament-status ${t.status === "Đang diễn ra" ? "tournament-status--live" : "tournament-status--upcoming"}`}>
                  {t.status}
                </span>
                <span className="tournament-category">{t.category}</span>
              </div>
              <h3>{t.name}</h3>
              <div className="tournament-card__meta">
                <span>📍 {t.venue}</span>
                <span>🏁 {t.races} cuộc đua</span>
              </div>
              <div className="tournament-card__prize">
                <span>Tổng giải thưởng</span>
                <strong>{t.prize}</strong>
              </div>
              <Link to="/tournaments" className="tournament-card__link">Xem chi tiết →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bộ sưu tập ảnh (Marquee) ── */}
      <section className="marquee-section">
        <div className="section-header">
          <span className="section-tag">Thư Viện</span>
          <h2>Khoảnh Khắc Đường Đua</h2>
        </div>
        <div className="marquee-track">
          <div className="marquee-slide">
            {[...MARQUEE_IMAGES, ...MARQUEE_IMAGES].map((img, i) => (
              <div key={i} className="marquee-item">
                <img src={img} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Kỵ Sĩ & Top Chủ Ngựa ── */}
      <section className="leader-section">
        <div className="section-header">
          <span className="section-tag">Bảng Xếp Hạng</span>
          <h2>Top Kỵ Sĩ & Chủ Ngựa</h2>
          <p>Những cá nhân xuất sắc nhất trên đường đua mùa giải này.</p>
        </div>
        <div className="leader-grid">
          {/* Kỵ Sĩ */}
          <div className="leader-panel">
            <h3>🏇 Top Kỵ Sĩ</h3>
            <div className="leader-list">
              {TOP_JOCKEYS.map((j) => (
                <div key={j.name} className="leader-card">
                  <span className="leader-card__rank">{j.rank}</span>
                  <div className="leader-card__info">
                    <strong>{j.name}</strong>
                    <span>{j.races} cuộc đua · {j.wins} thắng · Tỷ lệ {j.winRate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Chủ Ngựa */}
          <div className="leader-panel">
            <h3>🐎 Top Chủ Ngựa</h3>
            <div className="leader-list">
              {TOP_OWNERS.map((o) => (
                <div key={o.name} className="leader-card">
                  <span className="leader-card__rank">{o.rank}</span>
                  <div className="leader-card__info">
                    <strong>{o.name}</strong>
                    <span>{o.horses} ngựa · {o.wins} thắng · {o.entries} lượt đua</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Kết quả thi đấu gần đây ── */}
      <section className="results-section">
        <div className="section-header">
          <span className="section-tag">Kết Quả</span>
          <h2>Kết Quả Thi Đấu Gần Đây</h2>
          <p>Cập nhật kết quả mới nhất từ các cuộc đua đã hoàn thành.</p>
        </div>
        {recentRaces.length === 0 ? (
          <p className="muted">Chưa có cuộc đua nào hoàn thành.</p>
        ) : (
          <div className="results-table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Cuộc đua</th>
                  <th>Địa điểm</th>
                  <th>Cự ly</th>
                  <th>Thời gian</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentRaces.map((r) => (
                  <tr key={r.id ?? r.Id}>
                    <td className="results-race-name">{r.name ?? r.Name}</td>
                    <td>{r.location ?? r.Location ?? "—"}</td>
                    <td>{r.distance ?? r.Distance ?? "—"}m</td>
                    <td className="results-time">{formatTime(r.scheduledAt ?? r.ScheduledAt)}</td>
                    <td>
                      <Link to="/live-results" className="results-more-link">Kết quả →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to="/live-results" className="results-more">Xem tất cả kết quả →</Link>
          </div>
        )}
      </section>

      {/* ── CTA Đăng ký ── */}
      <section className="register-cta">
        <div className="register-cta__card">
          <h2>Bắt Đầu Hành Trình Của Bạn</h2>
          <p>Đăng ký ngay hôm nay để tham gia vào thế giới đua ngựa chuyên nghiệp.</p>
          <div className="register-cta__buttons">
            <Link to="/register/horse-owner" className="hero-btn hero-btn--primary">Đăng Ký Chủ Ngựa</Link>
            <Link to="/register/jockey" className="hero-btn hero-btn--primary">Đăng Ký Kỵ Sĩ</Link>
            <Link to="/register" className="hero-btn hero-btn--outline">Đăng Ký Khán Giả</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
