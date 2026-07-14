import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  approveJockey,
  approveRegistration,
  assignHorseToRace,
  cancelRace,
  createRace,
  createRound,
  createTournament,
  deleteTournament,
  endRace,
  getAdminDashboard,
  getAdminUser,
  getAdminUsers,
  getAdminTournaments,
  getAllRegistrations,
  getOwnerHorse,
  getOwnerHorses,
  getPendingRegistrations,
  getRegistrationDetail,
  getTournamentRaces,
  getTournamentRounds,
  publishRaceResult,
  rejectJockey,
  rejectRegistration,
  setUserActive,
  startRace,
  updateOwnerHorseStatus,
  updateTournament,
} from "../../services/adminApi";
import { getAvailableJockeys } from "../../services/jockeyApi";
import { resolveApiUrl } from "../../services/apiClient";
import { request } from "../../services/apiClient";
import {
  PrizeManagement,
  ProtestManagement,
  TransferManagement,
  ContractManagement,
  InjuryManagement,
} from "./AdminOperations";
import { AuditLogViewer, NotificationManager } from "./AdminAudit";
import "./AdminPage.css";

function AdminHorseImage({ imageUrl, name, className = "" }) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveApiUrl(imageUrl);
  const initial = String(name || "H")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  const handleViewImage = () => {
    if (!resolvedUrl) return;
    window.open(resolvedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`admin-horse-image ${className}`.trim()}>
      {resolvedUrl && !hasError ? (
        <button
          type="button"
          className="admin-horse-image__button"
          onClick={handleViewImage}
          aria-label={name ? `Xem ảnh ${name}` : "Xem ảnh ngựa"}
        >
          <img
            src={resolvedUrl}
            alt={name ? `${name} ngựa` : "Ngựa"}
            onError={() => setHasError(true)}
          />
        </button>
      ) : (
        <div
          className="admin-horse-image__fallback"
          aria-label="Không có ảnh ngựa"
        >
          <span>{initial}</span>
        </div>
      )}
    </div>
  );
}

const navGroups = [
  {
    label: "Dashboard",
    items: [
      {
        to: "/admin",
        label: "Tổng quan",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      },
    ],
  },
  {
    label: "Users",
    items: [
      {
        to: "/admin/users",
        label: "Người dùng",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
      },
      {
        to: "/admin/registrations",
        label: "Đăng ký",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      },
      {
        to: "/admin/roles",
        label: "Vai trò",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      },
    ],
  },
  {
    label: "Tournaments",
    items: [
      {
        to: "/admin/tournaments",
        label: "Giải đấu",
        icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      },
      {
        to: "/admin/rounds",
        label: "Vòng đấu",
        icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
      },
      {
        to: "/admin/races",
        label: "Cuộc đua",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        to: "/admin/prizes",
        label: "Tiền thưởng",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      {
        to: "/admin/protests",
        label: "Khiếu nại",
        icon: "M3 21l4-4V5a2 2 0 012-2h6a2 2 0 012 2v12l4 4",
      },
      {
        to: "/admin/transfers",
        label: "Chuyển nhượng",
        icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
      },
      {
        to: "/admin/contracts",
        label: "Hợp đồng",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      },
      {
        to: "/admin/injuries",
        label: "Chấn thương",
        icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        to: "/admin/audit",
        label: "Nhật ký",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      },
      {
        to: "/admin/notifications",
        label: "Thông báo",
        icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        to: "/admin/withdrawals",
        label: "Rút tiền",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
      },
    ],
  },
];

const roleCards = [
  ["Admin", "Toàn quyền kiểm soát và quản lý hệ thống"],
  ["Referee", "Điều khiển cuộc đua, xác nhận và kết quả"],
  ["HorseOwner", "Quản lý chuồng ngựa và đăng ký giải đấu"],
  ["Jockey", "Lời mời, lịch trình và thành tích"],
  ["Spectator", "Lịch trình, xếp hạng, dự đoán và phần thưởng"],
];

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "-";

const inputDate = (days = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 16);
};

const isGuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

function AdminShell({ children }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({ Operations: true });

  const toggleGroup = (label) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="ad-layout">
      {/* Mobile sidebar toggle */}
      <button
        className={`ad-mobile-toggle ${mobileOpen ? "ad-mobile-toggle--open" : ""}`}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mini Sidebar */}
      <aside
        className={`ad-sidebar ${expanded ? "ad-sidebar--exp" : ""} ${mobileOpen ? "ad-sidebar--mobile-open" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="ad-sidebar__logo">
          <img src="/logo.png" alt="RaceMaster" />
          {expanded && <span className="ad-sidebar__title">RaceMaster</span>}
        </div>
        <nav className="ad-sidebar__nav">
          {navGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.label] || false;
            return (
              <div key={group.label} className="ad-nav-group">
                <button
                  className="ad-nav-group__header"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleGroup(group.label);
                  }}
                  title={group.label}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={group.items[0].icon} />
                  </svg>
                  {expanded && (
                    <>
                      <span className="ad-nav-group__label">{group.label}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="currentColor"
                        style={{
                          marginLeft: "auto",
                          transform: isCollapsed
                            ? "rotate(-90deg)"
                            : "rotate(0)",
                          transition: "transform 0.15s",
                        }}
                      >
                        <path d="M4 2l4 4-4 4" />
                      </svg>
                    </>
                  )}
                </button>
                {(!expanded || !isCollapsed) && (
                  <div className="ad-nav-group__items">
                    {group.items.map((item) => {
                      const isActive =
                        item.to === "/admin"
                          ? location.pathname === "/admin"
                          : location.pathname.startsWith(item.to);
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={`ad-nav-link ${isActive ? "ad-nav-link--active" : ""}`}
                        >
                          {!expanded ? (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d={item.icon} />
                            </svg>
                          ) : (
                            <span className="ad-nav-label">{item.label}</span>
                          )}
                          {!expanded && (
                            <span className="ad-nav-link__tooltip">
                              {item.label}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="ad-main">
        <div className="ad-content">{children}</div>
      </div>
    </div>
  );
}

function PageTitle({ eyebrow, title, description, action }) {
  return (
    <section className="admin-title">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}

function Notice({ message, error }) {
  return message ? (
    <p className={error ? "admin-notice admin-notice--error" : "admin-notice"}>
      {message}
    </p>
  ) : null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const stats = [
    {
      label: "Tổng người dùng",
      value: data?.totalUsers ?? data?.TotalUsers ?? "-",
      trend: "+12%",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197",
      color: "#10b981",
    },
    {
      label: "Giải đấu",
      value: data?.activeTournaments ?? data?.ActiveTournaments ?? "-",
      trend: "+3",
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
      color: "#f2d28b",
    },
    {
      label: "Trực tiếp",
      value: data?.ongoingRaces ?? data?.OngoingRaces ?? "-",
      trend: "live",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "#ef4444",
    },
    {
      label: "Sắp tới",
      value: data?.upcomingRaces ?? data?.UpcomingRaces ?? "-",
      trend: "+2 hôm nay",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: "#6366f1",
    },
  ];

  const recentActivities = [
    {
      action: "Đăng ký ngựa",
      subject: "Thunder Strike",
      user: "John Whitfield",
      time: "5 phút trước",
      type: "registration",
    },
    {
      action: "Phê duyệt",
      subject: "Giải đấu Spring Cup",
      user: "Admin",
      time: "15 phút trước",
      type: "approval",
    },
    {
      action: "Hoàn thành",
      subject: "Cuộc đua #24 - Coastal Derby",
      user: "Hệ thống",
      time: "1 giờ trước",
      type: "race",
    },
    {
      action: "Chuyển nhượng",
      subject: "Silver Comet",
      user: "Marcus Lee",
      time: "2 giờ trước",
      type: "transfer",
    },
    {
      action: "Khiếu nại mới",
      subject: "Vòng 2 - Bán kết",
      user: "Trần Văn B",
      time: "3 giờ trước",
      type: "protest",
    },
  ];

  const pendingItems = [
    {
      label: "Đăng ký ngựa chờ duyệt",
      count: data?.pendingRegistrations ?? data?.PendingRegistrations ?? 0,
      priority: "high",
    },
    { label: "Đăng ký giải đấu", count: 3, priority: "medium" },
    {
      label: "Xác nhận trọng tài",
      count: data?.totalReferees ?? data?.TotalReferees ?? 0,
      priority: "low",
    },
  ];

  return (
    <>
      {/* Hero */}
      <div className="ad-hero">
        <div>
          <span
            className="pill"
            style={{ background: "rgba(215,170,77,0.15)", color: "#f2d28b" }}
          >
            Bảng điều khiển
          </span>
          <h1>Tổng quan hệ thống</h1>
          <p>Giám sát hoạt động nền tảng và duy trì vận hành đua.</p>
        </div>
        <div className="ad-hero-right">
          <div className="ad-hero-status">
            <span className="ad-dot ad-dot--green" />
            <span>Hệ thống hoạt động bình thường</span>
          </div>
          <div className="ad-quick-actions">
            <button
              className="ad-qa-btn"
              onClick={() => navigate("/admin/tournaments")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tạo giải đấu
            </button>
            <button
              className="ad-qa-btn"
              onClick={() => navigate("/admin/registrations")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
              Duyệt đăng ký
            </button>
          </div>
        </div>
      </div>
      {error && <Notice message={error} error />}

      {/* KPI Cards */}
      <section className="ad-kpis">
        {stats.map((s) => (
          <div key={s.label} className="ad-kpi">
            <div
              className="ad-kpi__icon"
              style={{ background: `${s.color}15`, color: s.color }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d={s.icon} />
              </svg>
            </div>
            <div className="ad-kpi__info">
              <span className="ad-kpi__label">{s.label}</span>
              <strong className="ad-kpi__value">{s.value}</strong>
              <span
                className={`ad-kpi__trend ${s.trend === "live" ? "ad-kpi__trend--live" : ""}`}
              >
                {s.trend === "live" ? "● Đang diễn ra" : s.trend}
              </span>
            </div>
            {/* Mini sparkline */}
            <div className="ad-kpi__spark">
              {[3, 4, 2, 5, 3, 4, 5].map((h, i) => (
                <span
                  key={i}
                  className="ad-spark-bar"
                  style={{ height: `${h * 5 + 4}px`, opacity: 0.4 + h * 0.1 }}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Charts row */}
      <section className="ad-charts">
        <div className="ad-card ad-card--chart">
          <h3>Tăng trưởng người dùng</h3>
          <div className="ad-area-chart">
            <svg viewBox="0 0 300 100" className="ad-area-svg">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2d28b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f2d28b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="url(#areaGrad)"
                points="0,80 30,60 60,70 90,40 120,50 150,30 180,35 210,20 240,25 270,15 300,10 300,100 0,100"
              />
              <polyline
                fill="none"
                stroke="#f2d28b"
                strokeWidth="2"
                points="0,80 30,60 60,70 90,40 120,50 150,30 180,35 210,20 240,25 270,15 300,10"
              />
            </svg>
            <div className="ad-chart-labels">
              <span>T2</span>
              <span>T4</span>
              <span>T6</span>
              <span>T8</span>
              <span>T10</span>
              <span>T12</span>
            </div>
          </div>
        </div>
        <div className="ad-card ad-card--chart">
          <h3>Phân bố giải đấu</h3>
          <div className="ad-donut">
            <div className="ad-donut-ring">
              <div className="ad-donut-hole">
                <strong>
                  {data?.activeTournaments ?? data?.ActiveTournaments ?? 0}
                </strong>
                <span>Hoạt động</span>
              </div>
            </div>
            <div className="ad-donut-legend">
              <div>
                <span style={{ background: "#f2d28b" }} />
                <label>Đang mở</label>
                <strong>
                  {data?.activeTournaments ?? data?.ActiveTournaments ?? 0}
                </strong>
              </div>
              <div>
                <span style={{ background: "#94a3b8" }} />
                <label>Đã đóng</label>
                <strong>
                  {data?.upcomingRaces ?? data?.UpcomingRaces ?? 0}
                </strong>
              </div>
              <div>
                <span style={{ background: "#10b981" }} />
                <label>Sắp diễn ra</label>
                <strong>8</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-column: Live Races + Approval Queue */}
      <section className="ad-grid-cols">
        <div className="ad-card">
          <div className="ad-card__header">
            <h3>Cuộc đua trực tiếp</h3>
            <span className="ad-badge ad-badge--live">● LIVE</span>
          </div>
          <div className="ad-card__body">
            <div className="ad-race-item">
              <div className="ad-race-dot ad-race-dot--live" />
              <div>
                <strong>Spring Championship</strong>
                <span>Vòng 3 · 8 ngựa tham gia</span>
              </div>
              <span className="ad-chip ad-chip--live">Đang đua</span>
            </div>
            <div className="ad-race-item">
              <div className="ad-race-dot ad-race-dot--live" />
              <div>
                <strong>Desert Cup</strong>
                <span>Vòng 1 · 6 ngựa tham gia</span>
              </div>
              <span className="ad-chip ad-chip--live">Đang đua</span>
            </div>
            <div className="ad-race-item">
              <div className="ad-race-dot ad-race-dot--upcoming" />
              <div>
                <strong>Night Derby</strong>
                <span>Bắt đầu sau 30 phút</span>
              </div>
              <span className="ad-chip ad-chip--upcoming">Sắp tới</span>
            </div>
            <div className="ad-race-item">
              <div className="ad-race-dot ad-race-dot--upcoming" />
              <div>
                <strong>Golden Mile</strong>
                <span>Bắt đầu sau 2 giờ</span>
              </div>
              <span className="ad-chip ad-chip--upcoming">Sắp tới</span>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__header">
            <h3>Hành động chờ xử lý</h3>
            <span className="ad-count">
              {pendingItems.reduce((s, i) => s + (i.count || 0), 0)}
            </span>
          </div>
          <div className="ad-card__body">
            {pendingItems.map((item) => {
              const priorities = {
                high: {
                  color: "#ef4444",
                  bg: "rgba(239,68,68,0.06)",
                  bar: "#ef4444",
                },
                medium: {
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.06)",
                  bar: "#f59e0b",
                },
                low: {
                  color: "#64748b",
                  bg: "rgba(100,116,139,0.06)",
                  bar: "#94a3b8",
                },
              };
              const p = priorities[item.priority];
              return (
                <div
                  key={item.label}
                  className="ad-action-card"
                  style={{ borderLeftColor: p.bar }}
                >
                  <div className="ad-action-card__top">
                    <div className="ad-action-card__info">
                      <strong>{item.label}</strong>
                      <span>{item.count} yêu cầu đang chờ</span>
                    </div>
                    <div
                      className="ad-action-card__count"
                      style={{ color: p.color }}
                    >
                      {item.count}
                    </div>
                  </div>
                  <div className="ad-action-card__bar">
                    <div
                      style={{
                        width: `${Math.min((item.count || 0) * 20, 100)}%`,
                        background: p.bar,
                      }}
                    />
                  </div>
                  <div className="ad-action-card__actions">
                    <button className="ad-btn-approve">Phê duyệt tất cả</button>
                    <button className="ad-btn-view">Xem chi tiết</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="ad-card">
        <div className="ad-card__header">
          <h3>Hoạt động gần đây</h3>
        </div>
        <div className="ad-card__body">
          <div className="ad-feed">
            {recentActivities.map((a, i) => (
              <div key={i} className="ad-feed-item">
                <div
                  className={`ad-feed-dot ${a.type === "registration" ? "ad-feed-dot--green" : a.type === "approval" ? "ad-feed-dot--gold" : a.type === "race" ? "ad-feed-dot--blue" : "ad-feed-dot--gray"}`}
                />
                <div className="ad-feed-content">
                  <strong>
                    {a.action}: {a.subject}
                  </strong>
                  <span>
                    {a.user} · {a.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const load = () =>
    getAdminUsers()
      .then((items) => setUsers(Array.isArray(items) ? items : []))
      .catch((err) => setMessage(err.message));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter((user) =>
        `${user.fullName ?? user.FullName ?? ""} ${user.email ?? user.Email ?? ""} ${user.role ?? user.Role ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, users],
  );

  const toggle = async (user) => {
    const id = user.id ?? user.Id;
    const active = user.isActive ?? user.IsActive;
    try {
      await setUserActive(id, !active);
      setMessage(
        `Người dùng ${active ? "đã khóa" : "đã kích hoạt lại"} thành công.`,
      );
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Quản lý người dùng"
        title="Danh sách người dùng"
        description="Tìm kiếm tài khoản, xem chi tiết và kiểm soát quyền truy cập."
      />
      <div className="admin-toolbar">
        <input
          placeholder="Tìm kiếm người dùng, email hoặc vai trò..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>{filtered.length} người dùng</span>
      </div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Tham gia</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const id = user.id ?? user.Id;
              const active = user.isActive ?? user.IsActive;
              return (
                <tr key={id}>
                  <td>
                    <strong>
                      {user.fullName ??
                        user.FullName ??
                        "Người dùng chưa đặt tên"}
                    </strong>
                    <small>{user.email ?? user.Email}</small>
                  </td>
                  <td>{user.role ?? user.Role}</td>
                  <td>{formatDate(user.createdAt ?? user.CreatedAt)}</td>
                  <td>
                    <span
                      className={
                        active
                          ? "status status--active"
                          : "status status--inactive"
                      }
                    >
                      {active ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => navigate(`/admin/users/${id}`)}>
                        Chi tiết
                      </button>
                      <button onClick={() => toggle(user)}>
                        {active ? "Khóa" : "Mở khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [horses, setHorses] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    getAdminUser(id)
      .then(async (userData) => {
        if (cancelled) return;

        setUser(userData);
        const userRole = userData?.role ?? userData?.Role;
        if (userRole === "HorseOwner") {
          const horseData = await getOwnerHorses(id);
          if (!cancelled) {
            setHorses(Array.isArray(horseData) ? horseData : []);
          }
        } else {
          setHorses([]);
        }
      })
      .catch((err) => {
        if (!cancelled) setMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);
  const active = user?.isActive ?? user?.IsActive;
  const role = user?.role ?? user?.Role;

  const toggle = async () => {
    try {
      await setUserActive(id, !active);
      setUser(await getAdminUser(id));
      setMessage(
        `Tài khoản ${active ? "đã khóa" : "đã kích hoạt lại"} thành công.`,
      );
    } catch (err) {
      setMessage(err.message);
    }
  };

  const changeHorseStatus = async (horse, status) => {
    let note = null;
    if (status === "Rejected") {
      note = window.prompt("Nhập lý do từ chối:");
      if (!note?.trim()) return;
    }

    try {
      await updateOwnerHorseStatus(id, horse.id ?? horse.Id, { status, note });
      setMessage(`${horse.name ?? horse.Name} đã đổi thành ${status}.`);
      const horseData = await getOwnerHorses(id);
      setHorses(Array.isArray(horseData) ? horseData : []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Quản lý người dùng"
        title="Chi tiết người dùng"
        description="Xem thông tin tài khoản và trạng thái truy cập."
        action={
          <button
            className="ghost-button"
            onClick={() => navigate("/admin/users")}
          >
            Quay lại danh sách
          </button>
        }
      />
      <Notice message={message} />
      <article className="admin-profile">
        <div className="admin-profile__avatar">
          {(user?.fullName ?? user?.FullName ?? "U").slice(0, 1)}
        </div>
        <div>
          <span
            className={
              active ? "status status--active" : "status status--inactive"
            }
          >
            {active ? "Hoạt động" : "Đã khóa"}
          </span>
          <h2>{user?.fullName ?? user?.FullName ?? "Đang tải..."}</h2>
          <p>{user?.email ?? user?.Email}</p>
        </div>
        <button className="primary-button" onClick={toggle} disabled={!user}>
          {active ? "Khóa người dùng" : "Mở khóa người dùng"}
        </button>
      </article>
      <section className="admin-detail-grid">
        <div>
          <span>Vai trò</span>
          <strong>{role ?? "-"}</strong>
        </div>
        <div>
          <span>Ngày tạo</span>
          <strong>{formatDate(user?.createdAt ?? user?.CreatedAt)}</strong>
        </div>
        <div>
          <span>Ngựa đã đăng ký</span>
          <strong>{user?.horseCount ?? user?.HorseCount ?? 0}</strong>
        </div>
        <div>
          <span>ID người dùng</span>
          <strong>{id}</strong>
        </div>
      </section>
      {role === "HorseOwner" && (
        <>
          <div className="section-heading">
            <h2>Ngựa của chủ sở hữu</h2>
            <p>Xem và thay đổi trạng thái phê duyệt cho từng con ngựa.</p>
          </div>
          <section className="admin-horse-grid">
            {horses.map((horse) => {
              const status = horse.approvalStatus ?? horse.ApprovalStatus;
              const horseName = horse.name ?? horse.Name ?? "Ngựa chưa đặt tên";
              return (
                <article
                  key={horse.id ?? horse.Id}
                  className="admin-horse-card"
                >
                  <div className="admin-horse-card__media">
                    <AdminHorseImage
                      imageUrl={horse.imageUrl ?? horse.ImageUrl}
                      name={horseName}
                    />
                  </div>
                  <div className="admin-horse-card__body">
                    <div className="admin-horse-card__heading">
                      <div>
                        <div className="admin-horse-card__title-row">
                          <h3>{horseName}</h3>
                          <span
                            className={`status status--${status?.toLowerCase()}`}
                          >
                            {status}
                          </span>
                        </div>
                        <p>
                          {horse.breed ?? horse.Breed ?? "Giống không xác định"}{" "}
                          ·{" "}
                          {horse.gender ??
                            horse.Gender ??
                            "Giới tính không xác định"}{" "}
                          · Tuổi {horse.age ?? horse.Age}
                        </p>
                      </div>
                      <button
                        className="admin-horse-card__detail"
                        onClick={() =>
                          navigate(
                            `/admin/users/${id}/horses/${horse.id ?? horse.Id}`,
                          )
                        }
                      >
                        Xem chi tiết
                      </button>
                    </div>
                    <div className="admin-horse-card__stats">
                      <div>
                        <span>Số cuộc đua</span>
                        <strong>
                          {horse.totalRaces ?? horse.TotalRaces ?? 0}
                        </strong>
                      </div>
                      <div>
                        <span>Thắng</span>
                        <strong>
                          {horse.totalWins ?? horse.TotalWins ?? 0}
                        </strong>
                      </div>
                      <div>
                        <span>Tỷ lệ thắng</span>
                        <strong>
                          {(horse.totalRaces ?? horse.TotalRaces)
                            ? `${Math.round(((horse.totalWins ?? horse.TotalWins ?? 0) / (horse.totalRaces ?? horse.TotalRaces)) * 100)}%`
                            : "0%"}
                        </strong>
                      </div>
                    </div>
                    {(horse.approvalNote ?? horse.ApprovalNote) && (
                      <p className="admin-horse-card__note">
                        {horse.approvalNote ?? horse.ApprovalNote}
                      </p>
                    )}
                  </div>
                  <div className="admin-actions admin-horse-card__actions">
                    {["Pending", "Approved", "Rejected"].map((nextStatus) => (
                      <button
                        className={`admin-horse-status-button admin-horse-status-button--${nextStatus.toLowerCase()}`}
                        key={nextStatus}
                        disabled={status === nextStatus}
                        onClick={() => changeHorseStatus(horse, nextStatus)}
                      >
                        {nextStatus}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </>
  );
}

function HorseDetail() {
  const { userId, horseId } = useParams();
  const [horse, setHorse] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    getOwnerHorse(userId, horseId)
      .then((data) => {
        if (!cancelled) setHorse(data);
      })
      .catch((err) => {
        if (!cancelled) setMessage(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [horseId, userId]);

  const value = (camel, pascal, fallback = "-") =>
    horse?.[camel] ?? horse?.[pascal] ?? fallback;
  const status = value("approvalStatus", "ApprovalStatus");

  return (
    <>
      <PageTitle
        eyebrow="Quản lý ngựa"
        title="Chi tiết ngựa"
        description="Xem thông tin đầy đủ về ngựa và dữ liệu sở hữu."
        action={
          <button
            className="ghost-button"
            onClick={() => navigate(`/admin/users/${userId}`)}
          >
            Quay lại chủ sở hữu
          </button>
        }
      />
      <Notice message={message} error />
      {horse && (
        <section className="admin-horse-detail">
          <article className="admin-horse-detail__hero">
            <AdminHorseImage
              className="admin-horse-detail__image"
              imageUrl={value("imageUrl", "ImageUrl", "")}
              name={value("name", "Name")}
            />
            <div>
              <span className={`status status--${status.toLowerCase()}`}>
                {status}
              </span>
              <h2>{value("name", "Name")}</h2>
              <p>
                {value("breed", "Breed", "Giống không xác định")} ·{" "}
                {value("gender", "Gender", "Giới tính không xác định")} ·{" "}
                {value("color", "Color", "Màu không xác định")}
              </p>
            </div>
          </article>
          <section className="admin-horse-detail__grid">
            <div>
              <span>Chủ sở hữu</span>
              <strong>{value("ownerName", "OwnerName")}</strong>
            </div>
            <div>
              <span>Tuổi</span>
              <strong>{value("age", "Age")}</strong>
            </div>
            <div>
              <span>Ngày sinh</span>
              <strong>
                {formatDate(value("dateOfBirth", "DateOfBirth", null))}
              </strong>
            </div>
            <div>
              <span>Cân nặng</span>
              <strong>{value("weight", "Weight")} kg</strong>
            </div>
            <div>
              <span>Chiều cao</span>
              <strong>{value("height", "Height")} cm</strong>
            </div>
            <div>
              <span>Tổng số cuộc đua</span>
              <strong>{value("totalRaces", "TotalRaces", 0)}</strong>
            </div>
            <div>
              <span>Tổng số thắng</span>
              <strong>{value("totalWins", "TotalWins", 0)}</strong>
            </div>
            <div>
              <span>Tỷ lệ thắng</span>
              <strong>
                {value("totalRaces", "TotalRaces", 0)
                  ? `${Math.round((value("totalWins", "TotalWins", 0) / value("totalRaces", "TotalRaces", 0)) * 100)}%`
                  : "0%"}
              </strong>
            </div>
            <div>
              <span>ID ngựa</span>
              <strong>{horseId}</strong>
            </div>
            <div>
              <span>ID chủ sở hữu</span>
              <strong>{value("ownerId", "OwnerId")}</strong>
            </div>
          </section>
          {value("approvalNote", "ApprovalNote", "") && (
            <article className="admin-horse-detail__note">
              <span>Ghi chú phê duyệt</span>
              <p>{value("approvalNote", "ApprovalNote")}</p>
            </article>
          )}
        </section>
      )}
    </>
  );
}

function Roles() {
  const [jockeys, setJockeys] = useState([]);
  const [message, setMessage] = useState("");

  const loadJockeys = () =>
    getAvailableJockeys()
      .then(setJockeys)
      .catch((err) => setMessage(err.message));

  useEffect(() => {
    loadJockeys();
  }, []);

  const updateJockeyStatus = async (jockey, approved) => {
    try {
      if (approved) {
        await approveJockey(jockey.id);
      } else {
        const reason = window.prompt("Lý do từ chối kỵ sĩ này?");
        if (reason === null) return;
        await rejectJockey(jockey.id, reason || "Bị từ chối bởi quản trị viên");
      }

      setMessage(
        `${jockey.fullName} ${approved ? "đã phê duyệt" : "đã từ chối"} thành công.`,
      );
      loadJockeys();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Quản lý người dùng"
        title="Quản lý vai trò"
        description="Tìm hiểu phạm vi quyền trên nền tảng RaceMaster."
      />
      <Notice message={message} />
      <section className="admin-role-grid">
        {roleCards.map(([role, detail]) => (
          <article key={role}>
            <span>{role.slice(0, 1)}</span>
            <h3>{role}</h3>
            <p>{detail}</p>
            <button disabled>Phân quyền qua API vai trò backend</button>
          </article>
        ))}
      </section>
      <p className="admin-muted-note">
        Phân quyền hiển thị không khả dụng vì backend hiện tại chưa có endpoint
        cập nhật vai trò.
      </p>
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <span>Quản lý kỵ sĩ</span>
          <h2>Phê duyệt kỵ sĩ</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kỵ sĩ</th>
                <th>Giấy phép</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {jockeys.map((jockey) => {
                const status = jockey.approvalStatusName || "Không xác định";
                return (
                  <tr key={jockey.id}>
                    <td>
                      <strong>{jockey.fullName}</strong>
                      <small>{jockey.email}</small>
                    </td>
                    <td>{jockey.licenseNumber || "-"}</td>
                    <td>
                      <span
                        className={`status status--${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          disabled={status === "Approved"}
                          onClick={() => updateJockeyStatus(jockey, true)}
                        >
                          Phê duyệt
                        </button>
                        <button
                          className="admin-danger"
                          disabled={status === "Rejected"}
                          onClick={() => updateJockeyStatus(jockey, false)}
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {jockeys.length === 0 ? (
                <tr>
                  <td colSpan="4">Không tìm thấy tài khoản kỵ sĩ nào.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function TournamentManagement() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: inputDate(7),
    endDate: inputDate(14),
    imageUrl: "",
  });
  const load = () =>
    getAdminTournaments()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setMessage(err.message));
  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await request("/api/auth/upload-document", {
        method: "POST",
        body: formData,
      });
      const d = res?.data ?? res;
      setForm((prev) => ({ ...prev, imageUrl: d?.url ?? "" }));
    } catch (e) {
      setMessage("Tải ảnh thất bại: " + (e.message ?? ""));
    }
    setUploading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (editingId) await updateTournament(editingId, payload);
      else await createTournament(payload);
      setMessage(
        `Giải đấu ${editingId ? "đã cập nhật" : "đã tạo"} thành công.`,
      );
      setShowForm(false);
      setEditingId("");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };
  const edit = (item) => {
    const toLocalInput = (value) => {
      const date = new Date(value);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };
    setEditingId(item.id ?? item.Id);
    setForm({
      name: item.name ?? item.Name ?? "",
      description: item.description ?? item.Description ?? "",
      startDate: toLocalInput(item.startDate ?? item.StartDate),
      endDate: toLocalInput(item.endDate ?? item.EndDate),
      imageUrl: item.imageUrl ?? item.ImageUrl ?? "",
    });
    setShowForm(true);
  };
  const remove = async (id) => {
    if (!window.confirm("Xóa giải đấu này?")) return;
    try {
      await deleteTournament(id);
      setMessage("Đã xóa giải đấu.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Quản lý giải đấu"
        title="Giải đấu"
        description="Tạo giải đấu và điều phối vòng đấu, cuộc đua."
        action={
          <button
            className="primary-button"
            onClick={() => {
              setEditingId("");
              setForm({
                name: "",
                description: "",
                startDate: inputDate(7),
                endDate: inputDate(14),
              });
              setShowForm(!showForm);
            }}
          >
            Tạo giải đấu
          </button>
        }
      />
      <Notice message={message} />
      {showForm && (
        <form className="admin-form" onSubmit={submit}>
          <input
            placeholder="Tên giải đấu"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="datetime-local"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            type="datetime-local"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <label style={{ fontSize: 13, color: "#657086" }}>
            Ảnh bìa giải đấu (tỉ lệ 3:1, đề xuất 1200×400px):
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
              style={{ display: "block", marginTop: 4 }}
            />
            {uploading ? (
              <span style={{ color: "#8f6420", fontSize: 12 }}>
                Đang tải ảnh...
              </span>
            ) : null}
          </label>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              style={{ width: 120, borderRadius: 8, marginTop: 4 }}
            />
          )}
          <button className="primary-button" disabled={uploading}>
            Lưu giải đấu
          </button>
        </form>
      )}
      <section className="admin-card-grid">
        {items.map((item) => {
          const id = item.id ?? item.Id;
          return (
            <article
              key={id}
              className="admin-tournament-card"
              style={{ position: "relative", overflow: "hidden" }}
            >
              {(item.imageUrl ?? item.ImageUrl) ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${item.imageUrl ?? item.ImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.15,
                  }}
                />
              ) : null}
              <div style={{ position: "relative", zIndex: 1 }}>
                <span
                  className={
                    (item.isActive ?? item.IsActive)
                      ? "status status--active"
                      : "status status--inactive"
                  }
                >
                  {(item.isActive ?? item.IsActive)
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
                <h3>{item.name ?? item.Name}</h3>
                <p>
                  {item.description ?? item.Description ?? "Không có mô tả"}
                </p>
              </div>
              <dl>
                <div>
                  <dt>Bắt đầu</dt>
                  <dd>{formatDate(item.startDate ?? item.StartDate)}</dd>
                </div>
                <div>
                  <dt>Vòng đấu</dt>
                  <dd>{item.roundCount ?? item.RoundCount ?? 0}</dd>
                </div>
                <div>
                  <dt>Cuộc đua</dt>
                  <dd>{item.raceCount ?? item.RaceCount ?? 0}</dd>
                </div>
              </dl>
              <div className="admin-actions">
                <button onClick={() => edit(item)}>Sửa</button>
                <button className="admin-danger" onClick={() => remove(id)}>
                  Xóa
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function ScheduleManagement({ type }) {
  const [tournaments, setTournaments] = useState([]);
  const [selected, setSelected] = useState("");
  const [items, setItems] = useState([]);
  const [approvedHorses, setApprovedHorses] = useState([]);
  const [approvedJockeys, setApprovedJockeys] = useState([]);
  const [message, setMessage] = useState("");
  const [assignment, setAssignment] = useState({
    raceId: "",
    horseId: "",
    jockeyId: "",
  });
  const [publishRaceId, setPublishRaceId] = useState(null);
  const [publishWinnerId, setPublishWinnerId] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [form, setForm] = useState(
    type === "round"
      ? {
          name: "",
          roundNumber: 1,
          scheduledStartDate: inputDate(7),
          scheduledEndDate: inputDate(8),
          description: "",
        }
      : {
          name: "",
          roundId: "",
          scheduledAt: inputDate(7),
          location: "",
          description: "",
          maxParticipants: 12,
          distance: 2000,
          imageUrl: "",
        },
  );

  useEffect(() => {
    getAdminTournaments()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTournaments(list);
        setSelected(list[0]?.id ?? list[0]?.Id ?? "");
      })
      .catch((err) => setMessage(err.message));
  }, []);
  useEffect(() => {
    if (type !== "race") return;

    const loadAssignmentOptions = async () => {
      try {
        const users = await getAdminUsers();
        const owners = (Array.isArray(users) ? users : []).filter(
          (user) => (user.role ?? user.Role) === "HorseOwner",
        );
        const horseGroups = await Promise.all(
          owners.map((owner) => getOwnerHorses(owner.id ?? owner.Id)),
        );
        const horses = horseGroups
          .flat()
          .filter(
            (horse) =>
              (horse.approvalStatus ?? horse.ApprovalStatus) === "Approved",
          );
        const jockeys = (await getAvailableJockeys()).filter(
          (jockey) =>
            jockey.approvalStatus === 2 ||
            jockey.approvalStatusName === "Approved",
        );

        setApprovedHorses(horses);
        setApprovedJockeys(jockeys);
      } catch (err) {
        setMessage(err.message);
      }
    };

    loadAssignmentOptions();
  }, [type]);
  useEffect(() => {
    if (!selected) return;
    const fetcher = type === "round" ? getTournamentRounds : getTournamentRaces;
    fetcher(selected)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setMessage(err.message));
  }, [selected, type]);

  const selectedHorse = approvedHorses.find(
    (horse) => (horse.id ?? horse.Id) === assignment.horseId,
  );
  const selectedHorseJockeyId =
    selectedHorse?.assignedJockeyId ?? selectedHorse?.AssignedJockeyId ?? "";
  const selectedHorseJockeyName =
    selectedHorse?.assignedJockeyName ??
    selectedHorse?.AssignedJockeyName ??
    "";
  const visibleHorses = assignment.jockeyId
    ? approvedHorses.filter((horse) => {
        const jockeyIds =
          horse.assignedJockeyIds ?? horse.AssignedJockeyIds ?? [];
        return (
          jockeyIds.includes(assignment.jockeyId) ||
          (horse.assignedJockeyId ?? horse.AssignedJockeyId) ===
            assignment.jockeyId
        );
      })
    : approvedHorses;

  const selectHorse = (horseId) => {
    const horse = approvedHorses.find(
      (item) => (item.id ?? item.Id) === horseId,
    );
    const assignedJockeyId =
      horse?.assignedJockeyId ?? horse?.AssignedJockeyId ?? "";

    setAssignment((current) => ({
      ...current,
      horseId,
      jockeyId: assignedJockeyId,
    }));
  };

  const selectJockey = (jockeyId) => {
    setAssignment((current) => {
      const horse = approvedHorses.find(
        (item) => (item.id ?? item.Id) === current.horseId,
      );
      const horseJockeyId =
        horse?.assignedJockeyId ?? horse?.AssignedJockeyId ?? "";

      return {
        ...current,
        jockeyId,
        horseId: jockeyId && horseJockeyId !== jockeyId ? "" : current.horseId,
      };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (type === "round") {
        await createRound(selected, {
          ...form,
          scheduledStartDate: new Date(form.scheduledStartDate).toISOString(),
          scheduledEndDate: new Date(form.scheduledEndDate).toISOString(),
        });
        setItems(await getTournamentRounds(selected));
      } else {
        await createRace({
          ...form,
          tournamentId: selected,
          roundId: form.roundId || null,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          maxParticipants: Number(form.maxParticipants),
          distance: Number(form.distance),
        });
        setItems(await getTournamentRaces(selected));
      }
      setMessage(
        `${type === "round" ? "Vòng đấu" : "Cuộc đua"} đã tạo thành công.`,
      );
    } catch (err) {
      setMessage(err.message);
    }
  };

  const assignHorse = async (event) => {
    event.preventDefault();
    const horseId = assignment.horseId.trim();
    const jockeyId = assignment.jockeyId.trim();

    if (!isGuid(horseId)) {
      setMessage("ID ngựa phải là GUID hợp lệ.");
      return;
    }

    if (jockeyId && !isGuid(jockeyId)) {
      setMessage("ID kỵ sĩ phải là GUID hợp lệ hoặc để trống.");
      return;
    }

    try {
      await assignHorseToRace(assignment.raceId, {
        horseId,
        jockeyId: jockeyId || null,
      });
      setMessage("Đã phân công ngựa vào cuộc đua thành công.");
      setAssignment({ raceId: "", horseId: "", jockeyId: "" });
      setItems(await getTournamentRaces(selected));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleRaceAction = async (raceId, action) => {
    const labels = {
      start: "bắt đầu",
      end: "kết thúc",
      cancel: "hủy",
      publish: "công bố kết quả",
    };
    if (action === "publish") {
      setPublishRaceId(raceId);
      setPublishWinnerId("");
      return;
    }
    if (
      !window.confirm(
        `${labels[action].charAt(0).toUpperCase() + labels[action].slice(1)} cuộc đua này?`,
      )
    )
      return;
    try {
      if (action === "start") await startRace(raceId);
      else if (action === "end") await endRace(raceId);
      else if (action === "cancel") await cancelRace(raceId);
      setMessage(`Cuộc đua đã ${labels[action]} thành công.`);
      setItems(await getTournamentRaces(selected));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const title =
    type === "round" ? "Quản lý vòng đấu" : "Quản lý cuộc đua & lên lịch";
  return (
    <>
      <PageTitle
        eyebrow="Quản lý giải đấu"
        title={title}
        description={
          type === "round"
            ? "Xây dựng giai đoạn giải đấu và xác định khung thời gian."
            : "Sắp xếp cuộc đua, đặt lịch và chuẩn bị phân công ngựa."
        }
      />
      <Notice message={message} />
      <div className="admin-select-row">
        <label>
          Giải đấu
          <select
            className="admin-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {tournaments.map((item) => (
              <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                {item.name ?? item.Name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <input
          placeholder={`Tên ${type === "round" ? "vòng đấu" : "cuộc đua"}`}
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {type === "round" ? (
          <>
            <input
              type="number"
              min="1"
              value={form.roundNumber}
              onChange={(e) =>
                setForm({ ...form, roundNumber: Number(e.target.value) })
              }
            />
            <input
              type="datetime-local"
              value={form.scheduledStartDate}
              onChange={(e) =>
                setForm({ ...form, scheduledStartDate: e.target.value })
              }
            />
            <input
              type="datetime-local"
              value={form.scheduledEndDate}
              onChange={(e) =>
                setForm({ ...form, scheduledEndDate: e.target.value })
              }
            />
          </>
        ) : (
          <>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />
            <input
              placeholder="Địa điểm"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <input
              type="number"
              min="1"
              placeholder="Số người tham gia tối đa"
              value={form.maxParticipants}
              onChange={(e) =>
                setForm({ ...form, maxParticipants: e.target.value })
              }
            />
            <input
              type="number"
              min="100"
              placeholder="Khoảng cách (m)"
              value={form.distance}
              onChange={(e) => setForm({ ...form, distance: e.target.value })}
            />
            <label style={{ fontSize: 13, color: "#657086" }}>
              Ảnh nền cuộc đua:
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const fd = new FormData();
                  fd.append("file", f);
                  try {
                    const r = await request("/api/auth/upload-document", {
                      method: "POST",
                      body: fd,
                    });
                    const d = r?.data ?? r;
                    setForm((p) => ({ ...p, imageUrl: d?.url ?? "" }));
                  } catch {}
                }}
                style={{ display: "block", marginTop: 4 }}
              />
            </label>
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                style={{ width: 120, borderRadius: 8 }}
              />
            )}
          </>
        )}
        <button className="primary-button" disabled={!selected}>
          Tạo {type === "round" ? "vòng đấu" : "cuộc đua"}
        </button>
      </form>
      {type === "race" && (
        <form className="admin-form" onSubmit={assignHorse}>
          <select
            className="admin-select"
            required
            value={assignment.raceId}
            onChange={(e) =>
              setAssignment({ ...assignment, raceId: e.target.value })
            }
          >
            <option value="">Chọn cuộc đua để phân công ngựa</option>
            {items.map((item) => (
              <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                {item.name ?? item.Name}
              </option>
            ))}
          </select>
          <select
            className="admin-select"
            required
            value={assignment.horseId}
            onChange={(e) => selectHorse(e.target.value)}
          >
            <option value="">Chọn ngựa đã được phê duyệt</option>
            {visibleHorses.map((horse) => {
              const jockeyName =
                horse.assignedJockeyName ?? horse.AssignedJockeyName;
              const assignmentStatus =
                horse.jockeyAssignmentStatus ?? horse.JockeyAssignmentStatus;
              return (
                <option key={horse.id ?? horse.Id} value={horse.id ?? horse.Id}>
                  {horse.name ?? horse.Name} ·{" "}
                  {jockeyName
                    ? `${jockeyName} (${assignmentStatus || "Đã phân công"})`
                    : "Không có kỵ sĩ"}
                </option>
              );
            })}
          </select>
          <select
            className="admin-select"
            value={assignment.jockeyId}
            onChange={(e) => selectJockey(e.target.value)}
            disabled={Boolean(selectedHorseJockeyId)}
          >
            <option value="">Không có kỵ sĩ</option>
            {approvedJockeys.map((jockey) => (
              <option key={jockey.id} value={jockey.id}>
                {jockey.fullName}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            disabled={!assignment.raceId || !assignment.horseId}
          >
            Phân công ngựa
          </button>
        </form>
      )}
      {type === "race" && selectedHorseJockeyId ? (
        <p className="admin-muted-note">
          Ngựa này được phân công cho{" "}
          {selectedHorseJockeyName || "kỵ sĩ đã chọn"}. Kỵ sĩ sẽ được thêm tự
          động.
        </p>
      ) : null}
      {type === "race" && approvedJockeys.length === 0 ? (
        <p className="admin-muted-note">
          Không có kỵ sĩ nào được phê duyệt. Hãy phê duyệt tài khoản kỵ sĩ trong
          Quản lý vai trò trước khi phân công vào cuộc đua.
        </p>
      ) : null}

      {/* Publish Result Modal */}
      {publishRaceId && (
        <div className="modal-overlay" onClick={() => setPublishRaceId(null)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.96)",
              borderRadius: 18,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: 17,
                fontWeight: 700,
                color: "#1a1d23",
              }}
            >
              Công bố kết quả
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
              Nhập ID ngựa chiến thắng để công bố kết quả cuộc đua.
            </p>
            <input
              className="admin-select"
              placeholder="Winning Horse ID (GUID)"
              value={publishWinnerId}
              onChange={(e) => setPublishWinnerId(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginBottom: 12,
              }}
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                className="ghost-button"
                onClick={() => setPublishRaceId(null)}
              >
                Huỷ
              </button>
              <button
                className="primary-button"
                disabled={!publishWinnerId || publishLoading}
                onClick={async () => {
                  setPublishLoading(true);
                  try {
                    await publishRaceResult(publishRaceId, {
                      winningHorseId: publishWinnerId,
                    });
                    setMessage("Kết quả đã được công bố!");
                    setPublishRaceId(null);
                    setItems(await getTournamentRaces(selected));
                  } catch (err) {
                    setMessage(err.message);
                  } finally {
                    setPublishLoading(false);
                  }
                }}
              >
                {publishLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="admin-card-grid">
        {items.map((item) => {
          const itemId = item.id ?? item.Id;
          const itemStatus = (item.status ?? item.Status ?? "").toLowerCase();
          return (
            <article key={itemId} className="admin-simple-card">
              <span className="badge">
                {item.status ??
                  item.Status ??
                  `#${item.roundNumber ?? item.RoundNumber ?? ""}`}
              </span>
              <h3>{item.name ?? item.Name}</h3>
              <p>
                {formatDate(
                  item.scheduledAt ??
                    item.ScheduledAt ??
                    item.scheduledStartDate ??
                    item.ScheduledStartDate,
                )}
              </p>
              <small>
                {type === "round"
                  ? `${item.raceCount ?? item.RaceCount ?? 0} cuộc đua`
                  : `${item.entriesCount ?? item.EntriesCount ?? 0} ngựa đã phân công`}
              </small>
              {type === "race" && (
                <div className="admin-actions admin-race-actions">
                  {itemStatus !== "inprogress" && itemStatus !== "finished" && (
                    <button
                      onClick={() => handleRaceAction(itemId, "start")}
                      disabled={itemStatus === "cancelled"}
                    >
                      Bắt đầu
                    </button>
                  )}
                  {itemStatus === "inprogress" && (
                    <button onClick={() => handleRaceAction(itemId, "end")}>
                      Kết thúc
                    </button>
                  )}
                  {itemStatus === "finished" && (
                    <button
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        color: "#0f7a5a",
                      }}
                      onClick={() => handleRaceAction(itemId, "publish")}
                    >
                      Công bố KQ
                    </button>
                  )}
                  {itemStatus !== "finished" && itemStatus !== "cancelled" && (
                    <button
                      className="admin-danger"
                      onClick={() => handleRaceAction(itemId, "cancel")}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}

function RegistrationManagement() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [regTab, setRegTab] = useState("pending");

  const load = () => {
    const api =
      regTab === "all" ? getAllRegistrations() : getPendingRegistrations();
    api
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setMessage(err.message));
  };

  useEffect(() => {
    load();
  }, [regTab]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const search =
          `${item.fullName ?? item.FullName ?? ""} ${item.email ?? item.Email ?? ""} ${item.requestedRole ?? item.RequestedRole ?? ""}`.toLowerCase();
        return search.includes(query.toLowerCase());
      }),
    [query, items],
  );

  const approve = async (registration) => {
    const id = registration.id ?? registration.Id;
    try {
      await approveRegistration(id);
      setMessage("Đăng ký đã được phê duyệt.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const reject = async (registration) => {
    const id = registration.id ?? registration.Id;
    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return;
    try {
      await rejectRegistration(id, reason || "Bị từ chối bởi quản trị viên");
      setMessage("Đăng ký đã bị từ chối.");
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Quản lý người dùng"
        title="Phê duyệt đăng ký"
        description="Xem xét và phê duyệt đăng ký người dùng mới trước khi họ có thể truy cập nền tảng."
      />
      <div className="admin-toolbar">
        <input
          placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "rgba(0,0,0,0.03)",
            padding: 3,
            borderRadius: 8,
          }}
        >
          <button
            style={{
              padding: "5px 14px",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              background: regTab === "pending" ? "#fff" : "transparent",
              color: regTab === "pending" ? "#1a1d23" : "#64748b",
              boxShadow:
                regTab === "pending" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
            onClick={() => setRegTab("pending")}
          >
            Đang chờ
          </button>
          <button
            style={{
              padding: "5px 14px",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              background: regTab === "all" ? "#fff" : "transparent",
              color: regTab === "all" ? "#1a1d23" : "#64748b",
              boxShadow:
                regTab === "all" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
            onClick={() => setRegTab("all")}
          >
            Tất cả
          </button>
        </div>
        <span>
          {filtered.length} {regTab === "pending" ? "đang chờ" : "bản ghi"}
        </span>
      </div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const id = item.id ?? item.Id;
              const status = item.status ?? item.Status ?? "Pending";
              return (
                <tr key={id}>
                  <td>
                    <strong>{item.fullName ?? item.FullName ?? "N/A"}</strong>
                  </td>
                  <td>{item.email ?? item.Email}</td>
                  <td>{item.requestedRole ?? item.RequestedRole}</td>
                  <td>
                    <span className={`status status--${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  <td>{formatDate(item.createdAt ?? item.CreatedAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        disabled={status !== "Pending"}
                        onClick={() => approve(item)}
                      >
                        Phê duyệt
                      </button>
                      <button
                        className="admin-danger"
                        disabled={status !== "Pending"}
                        onClick={() => reject(item)}
                      >
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>Không tìm thấy đăng ký đang chờ nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminPage() {
  const location = useLocation();
  let content = <Dashboard />;
  if (location.pathname === "/admin/users") content = <UserList />;
  else if (location.pathname === "/admin/registrations")
    content = <RegistrationManagement />;
  else if (location.pathname.includes("/horses/")) content = <HorseDetail />;
  else if (location.pathname.startsWith("/admin/users/"))
    content = <UserDetail />;
  else if (location.pathname === "/admin/roles") content = <Roles />;
  else if (location.pathname === "/admin/tournaments")
    content = <TournamentManagement />;
  else if (location.pathname === "/admin/rounds")
    content = <ScheduleManagement type="round" />;
  else if (location.pathname === "/admin/races")
    content = <ScheduleManagement type="race" />;
  else if (location.pathname === "/admin/prizes") content = <PrizeManagement />;
  else if (location.pathname === "/admin/protests")
    content = <ProtestManagement />;
  else if (location.pathname === "/admin/transfers")
    content = <TransferManagement />;
  else if (location.pathname === "/admin/contracts")
    content = <ContractManagement />;
  else if (location.pathname === "/admin/injuries")
    content = <InjuryManagement />;
  else if (location.pathname === "/admin/audit") content = <AuditLogViewer />;
  else if (location.pathname === "/admin/notifications")
    content = <NotificationManager />;
  else if (location.pathname === "/admin/withdrawals")
    content = <WithdrawalManagement />;

  return <AdminShell>{content}</AdminShell>;
}

export default AdminPage;

/* ─── Withdrawal Management ─── */

function WithdrawalManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await request("/api/withdrawal/admin/pending");
      const d = res?.data ?? res;
      setList(Array.isArray(d) ? d : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleProcess = async (id, status) => {
    setProcessing(id);
    try {
      await request("/api/withdrawal/admin/process", {
        method: "POST",
        body: JSON.stringify({ withdrawalId: id, status }),
      });
      fetchList();
    } catch (e) {
      alert(e?.message ?? "Xử lý thất bại.");
    }
    setProcessing(null);
  };

  return (
    <div>
      <PageTitle
        eyebrow="Tài chính"
        title="Quản lý rút tiền"
        description="Duyệt yêu cầu rút tiền từ người dùng."
      />

      {loading ? (
        <p>Đang tải...</p>
      ) : list.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "40px 0", color: "#657086" }}
        >
          <p>Không có yêu cầu rút tiền nào đang chờ.</p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid rgba(231,198,120,.1)",
            borderRadius: 16,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "rgba(255, 250, 240, 0.96)",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Người dùng
                </th>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Ngân hàng
                </th>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Số tài khoản
                </th>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Số tiền
                </th>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Ngày yêu cầu
                </th>
                <th
                  style={{
                    padding: 15,
                    textAlign: "left",
                    borderBottom: "1px solid rgba(231,198,120,.07)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#657086",
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id ?? w.Id}>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: "1px solid rgba(231,198,120,.07)",
                      fontSize: 13,
                      color: "#34415b",
                    }}
                  >
                    {w.userName ?? w.UserName ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: "1px solid rgba(231,198,120,.07)",
                      fontSize: 13,
                      color: "#34415b",
                    }}
                  >
                    {w.bankName ?? w.BankName ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: "1px solid rgba(231,198,120,.07)",
                      fontSize: 13,
                      color: "#34415b",
                    }}
                  >
                    {w.accountNumber ?? w.AccountNumber ?? "-"}
                  </td>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: "1px solid rgba(231,198,120,.07)",
                      fontSize: 13,
                      color: "#34415b",
                    }}
                  >
                    <strong>
                      {(w.amount ?? w.Amount ?? 0).toLocaleString()}đ
                    </strong>
                  </td>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: "1px solid rgba(231,198,120,.07)",
                      fontSize: 13,
                      color: "#34415b",
                    }}
                  >
                    {w.createdAt
                      ? new Date(w.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        border: "none",
                        background: "#1a7d1a",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                      disabled={processing === (w.id ?? w.Id)}
                      onClick={() => handleProcess(w.id ?? w.Id, "completed")}
                    >
                      {processing === (w.id ?? w.Id) ? "..." : "Đã chuyển tiền"}
                    </button>
                    <button
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        border: "none",
                        background: "#c41e1e",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                      disabled={processing === (w.id ?? w.Id)}
                      onClick={() => handleProcess(w.id ?? w.Id, "rejected")}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
