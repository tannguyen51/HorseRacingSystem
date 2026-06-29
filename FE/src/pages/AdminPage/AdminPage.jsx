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
  getOwnerHorse,
  getOwnerHorses,
  getPendingRegistrations,
  getTournamentRaces,
  getTournamentRounds,
  rejectJockey,
  rejectRegistration,
  setUserActive,
  startRace,
  updateOwnerHorseStatus,
  updateTournament,
} from "../../services/adminApi";
import { getAvailableJockeys } from "../../services/jockeyApi";
import { resolveApiUrl } from "../../services/apiClient";
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
  const initial = String(name || "H").trim().slice(0, 1).toUpperCase();

  useEffect(() => {
    setHasError(false);
  }, [resolvedUrl]);

  return (
    <div className={`admin-horse-image ${className}`.trim()}>
      {resolvedUrl && !hasError ? (
        <img
          src={resolvedUrl}
          alt={name ? `${name} ngựa` : "Ngựa"}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="admin-horse-image__fallback" aria-label="Không có ảnh ngựa">
          <span>{initial}</span>
          <small>Không có ảnh</small>
        </div>
      )}
    </div>
  );
}

const navGroups = [
  { label: "Tổng quan", items: [{ to: "/admin", label: "Bảng điều khiển", end: true }] },
  {
    label: "Quản lý người dùng",
    items: [
      { to: "/admin/users", label: "Danh sách người dùng" },
      { to: "/admin/registrations", label: "Đăng ký" },
      { to: "/admin/roles", label: "Quản lý vai trò" },
    ],
  },
  {
    label: "Quản lý giải đấu",
    items: [
      { to: "/admin/tournaments", label: "Giải đấu" },
      { to: "/admin/rounds", label: "Vòng đấu" },
      { to: "/admin/races", label: "Cuộc đua & Lịch trình" },
    ],
  },
  {
    label: "Vận hành",
    items: [
      { to: "/admin/prizes", label: "Tiền thưởng" },
      { to: "/admin/protests", label: "Khiếu nại" },
      { to: "/admin/transfers", label: "Chuyển nhượng ngựa" },
      { to: "/admin/contracts", label: "Hợp đồng" },
      { to: "/admin/injuries", label: "Hồ sơ chấn thương" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { to: "/admin/audit", label: "Nhật ký kiểm toán" },
      { to: "/admin/notifications", label: "Thông báo" },
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
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value))
    : "-";

const inputDate = (days = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 16);
};

const isGuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );

function AdminShell({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__intro">
          <span className="pill">Quản trị</span>
          <h3>Trung tâm điều khiển</h3>
          <p>Vận hành người dùng, giải đấu, vòng đấu và lịch đua.</p>
        </div>
        <nav className="admin-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="admin-nav__group">
              <span>{group.label}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? "admin-nav__link admin-nav__link--active" : "admin-nav__link"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="admin-content">{children}</div>
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
  return message ? <p className={error ? "admin-notice admin-notice--error" : "admin-notice"}>{message}</p> : null;
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  const stats = [
    ["Tổng người dùng", data?.totalUsers ?? data?.TotalUsers ?? "-"],
    ["Giải đấu đang hoạt động", data?.activeTournaments ?? data?.ActiveTournaments ?? "-"],
    ["Cuộc đua trực tiếp", data?.ongoingRaces ?? data?.OngoingRaces ?? "-"],
    ["Cuộc đua sắp tới", data?.upcomingRaces ?? data?.UpcomingRaces ?? "-"],
  ];

  return (
    <>
      <PageTitle eyebrow="Bảng điều khiển" title="Tổng quan hệ thống" description="Giám sát hoạt động nền tảng và duy trì vận hành đua." />
      <Notice message={error} error />
      <section className="admin-stat-grid">
        {stats.map(([label, value]) => (
          <article key={label} className="admin-stat-card">
            <span>{label}</span><strong>{value}</strong><small>Dữ liệu nền tảng trực tiếp</small>
          </article>
        ))}
      </section>
      <section className="admin-panel-grid">
        <article className="admin-panel">
          <div className="admin-panel__heading"><div><span>Phân tích hệ thống</span><h2>Tình trạng vận hành</h2></div></div>
          <div className="admin-bars">
            {[["Hoạt động người dùng", 82], ["Sức chứa giải đấu", 68], ["Lên lịch đua", 74], ["Khả dụng nền tảng", 99]].map(([label, value]) => (
              <div key={label}><p><span>{label}</span><strong>{value}%</strong></p><div><i style={{ width: `${value}%` }} /></div></div>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <div className="admin-panel__heading"><div><span>Cần chú ý</span><h2>Hàng đợi quản trị</h2></div></div>
          <div className="admin-queue">
            <div><strong>{data?.pendingRegistrations ?? data?.PendingRegistrations ?? "-"}</strong><span>Đăng ký chờ duyệt</span></div>
            <div><strong>{data?.totalReferees ?? data?.TotalReferees ?? "-"}</strong><span>Trọng tài khả dụng</span></div>
            <div><strong>{data?.upcomingRaces ?? data?.UpcomingRaces ?? "-"}</strong><span>Cuộc đua cần điều phối</span></div>
          </div>
        </article>
      </section>
    </>
  );
}

function UserList() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const load = () => getAdminUsers().then((items) => setUsers(Array.isArray(items) ? items : [])).catch((err) => setMessage(err.message));
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => users.filter((user) =>
    `${user.fullName ?? user.FullName ?? ""} ${user.email ?? user.Email ?? ""} ${user.role ?? user.Role ?? ""}`.toLowerCase().includes(query.toLowerCase())
  ), [query, users]);

  const toggle = async (user) => {
    const id = user.id ?? user.Id;
    const active = user.isActive ?? user.IsActive;
    try {
      await setUserActive(id, !active);
      setMessage(`Người dùng ${active ? "đã khóa" : "đã kích hoạt lại"} thành công.`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle eyebrow="Quản lý người dùng" title="Danh sách người dùng" description="Tìm kiếm tài khoản, xem chi tiết và kiểm soát quyền truy cập." />
      <div className="admin-toolbar"><input placeholder="Tìm kiếm người dùng, email hoặc vai trò..." value={query} onChange={(e) => setQuery(e.target.value)} /><span>{filtered.length} người dùng</span></div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table"><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Tham gia</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>{filtered.map((user) => {
            const id = user.id ?? user.Id;
            const active = user.isActive ?? user.IsActive;
            return <tr key={id}>
              <td><strong>{user.fullName ?? user.FullName ?? "Người dùng chưa đặt tên"}</strong><small>{user.email ?? user.Email}</small></td>
              <td>{user.role ?? user.Role}</td><td>{formatDate(user.createdAt ?? user.CreatedAt)}</td>
              <td><span className={active ? "status status--active" : "status status--inactive"}>{active ? "Hoạt động" : "Đã khóa"}</span></td>
              <td><div className="admin-actions"><button onClick={() => navigate(`/admin/users/${id}`)}>Chi tiết</button><button onClick={() => toggle(user)}>{active ? "Khóa" : "Mở khóa"}</button></div></td>
            </tr>;
          })}</tbody>
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
      setMessage(`Tài khoản ${active ? "đã khóa" : "đã kích hoạt lại"} thành công.`);
    } catch (err) { setMessage(err.message); }
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
      <PageTitle eyebrow="Quản lý người dùng" title="Chi tiết người dùng" description="Xem thông tin tài khoản và trạng thái truy cập." action={<button className="ghost-button" onClick={() => navigate("/admin/users")}>Quay lại danh sách</button>} />
      <Notice message={message} />
      <article className="admin-profile">
        <div className="admin-profile__avatar">{(user?.fullName ?? user?.FullName ?? "U").slice(0, 1)}</div>
        <div><span className={active ? "status status--active" : "status status--inactive"}>{active ? "Hoạt động" : "Đã khóa"}</span><h2>{user?.fullName ?? user?.FullName ?? "Đang tải..."}</h2><p>{user?.email ?? user?.Email}</p></div>
        <button className="primary-button" onClick={toggle} disabled={!user}>{active ? "Khóa người dùng" : "Mở khóa người dùng"}</button>
      </article>
      <section className="admin-detail-grid">
        <div><span>Vai trò</span><strong>{role ?? "-"}</strong></div>
        <div><span>Ngày tạo</span><strong>{formatDate(user?.createdAt ?? user?.CreatedAt)}</strong></div>
        <div><span>Ngựa đã đăng ký</span><strong>{user?.horseCount ?? user?.HorseCount ?? 0}</strong></div>
        <div><span>ID người dùng</span><strong>{id}</strong></div>
      </section>
      {role === "HorseOwner" && <>
        <div className="section-heading">
          <h2>Ngựa của chủ sở hữu</h2>
          <p>Xem và thay đổi trạng thái phê duyệt cho từng con ngựa.</p>
        </div>
        <section className="admin-horse-grid">
          {horses.map((horse) => {
            const status = horse.approvalStatus ?? horse.ApprovalStatus;
            const horseName = horse.name ?? horse.Name ?? "Ngựa chưa đặt tên";
            return <article key={horse.id ?? horse.Id} className="admin-horse-card">
              <div className="admin-horse-card__media">
                <AdminHorseImage
                  imageUrl={horse.imageUrl ?? horse.ImageUrl}
                  name={horseName}
                />
                <span className={`status status--${status?.toLowerCase()}`}>{status}</span>
              </div>
              <div className="admin-horse-card__body">
                <div className="admin-horse-card__heading">
                  <div>
                    <h3>{horseName}</h3>
                    <p>{horse.breed ?? horse.Breed ?? "Giống không xác định"} · {horse.gender ?? horse.Gender ?? "Giới tính không xác định"} · Tuổi {horse.age ?? horse.Age}</p>
                  </div>
                  <button
                    className="admin-horse-card__detail"
                    onClick={() => navigate(`/admin/users/${id}/horses/${horse.id ?? horse.Id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
                <div className="admin-horse-card__stats">
                  <div><span>Số cuộc đua</span><strong>{horse.totalRaces ?? horse.TotalRaces ?? 0}</strong></div>
                  <div><span>Thắng</span><strong>{horse.totalWins ?? horse.TotalWins ?? 0}</strong></div>
                  <div><span>Tỷ lệ thắng</span><strong>{horse.totalRaces ?? horse.TotalRaces ? `${Math.round(((horse.totalWins ?? horse.TotalWins ?? 0) / (horse.totalRaces ?? horse.TotalRaces)) * 100)}%` : "0%"}</strong></div>
                </div>
                {(horse.approvalNote ?? horse.ApprovalNote) && <p className="admin-horse-card__note">{horse.approvalNote ?? horse.ApprovalNote}</p>}
              </div>
              <div className="admin-actions admin-horse-card__actions">
                {["Pending", "Approved", "Rejected"].map((nextStatus) => <button className={`admin-horse-status-button admin-horse-status-button--${nextStatus.toLowerCase()}`} key={nextStatus} disabled={status === nextStatus} onClick={() => changeHorseStatus(horse, nextStatus)}>{nextStatus}</button>)}
              </div>
            </article>;
          })}
        </section>
      </>}
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
        action={<button className="ghost-button" onClick={() => navigate(`/admin/users/${userId}`)}>Quay lại chủ sở hữu</button>}
      />
      <Notice message={message} error />
      {horse && <section className="admin-horse-detail">
        <article className="admin-horse-detail__hero">
          <AdminHorseImage
            className="admin-horse-detail__image"
            imageUrl={value("imageUrl", "ImageUrl", "")}
            name={value("name", "Name")}
          />
          <div>
            <span className={`status status--${status.toLowerCase()}`}>{status}</span>
            <h2>{value("name", "Name")}</h2>
            <p>{value("breed", "Breed", "Giống không xác định")} · {value("gender", "Gender", "Giới tính không xác định")} · {value("color", "Color", "Màu không xác định")}</p>
          </div>
        </article>
        <section className="admin-horse-detail__grid">
          <div><span>Chủ sở hữu</span><strong>{value("ownerName", "OwnerName")}</strong></div>
          <div><span>Tuổi</span><strong>{value("age", "Age")}</strong></div>
          <div><span>Ngày sinh</span><strong>{formatDate(value("dateOfBirth", "DateOfBirth", null))}</strong></div>
          <div><span>Cân nặng</span><strong>{value("weight", "Weight")} kg</strong></div>
          <div><span>Chiều cao</span><strong>{value("height", "Height")} cm</strong></div>
          <div><span>Tổng số cuộc đua</span><strong>{value("totalRaces", "TotalRaces", 0)}</strong></div>
          <div><span>Tổng số thắng</span><strong>{value("totalWins", "TotalWins", 0)}</strong></div>
          <div><span>Tỷ lệ thắng</span><strong>{value("totalRaces", "TotalRaces", 0) ? `${Math.round((value("totalWins", "TotalWins", 0) / value("totalRaces", "TotalRaces", 0)) * 100)}%` : "0%"}</strong></div>
          <div><span>ID ngựa</span><strong>{horseId}</strong></div>
          <div><span>ID chủ sở hữu</span><strong>{value("ownerId", "OwnerId")}</strong></div>
        </section>
        {(value("approvalNote", "ApprovalNote", "")) && <article className="admin-horse-detail__note"><span>Ghi chú phê duyệt</span><p>{value("approvalNote", "ApprovalNote")}</p></article>}
      </section>}
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
      <PageTitle eyebrow="Quản lý người dùng" title="Quản lý vai trò" description="Tìm hiểu phạm vi quyền trên nền tảng RaceMaster." />
      <Notice message={message} />
      <section className="admin-role-grid">{roleCards.map(([role, detail]) => <article key={role}><span>{role.slice(0, 1)}</span><h3>{role}</h3><p>{detail}</p><button disabled>Phân quyền qua API vai trò backend</button></article>)}</section>
      <p className="admin-muted-note">Phân quyền hiển thị không khả dụng vì backend hiện tại chưa có endpoint cập nhật vai trò.</p>
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
                      <span className={`status status--${status.toLowerCase()}`}>
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
  const [form, setForm] = useState({ name: "", description: "", startDate: inputDate(7), endDate: inputDate(14) });
  const load = () => getAdminTournaments().then((data) => setItems(Array.isArray(data) ? data : [])).catch((err) => setMessage(err.message));
  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() };
      if (editingId) await updateTournament(editingId, payload);
      else await createTournament(payload);
      setMessage(`Giải đấu ${editingId ? "đã cập nhật" : "đã tạo"} thành công.`);
      setShowForm(false); setEditingId(""); load();
    } catch (err) { setMessage(err.message); }
  };
  const edit = (item) => {
    const toLocalInput = (value) => {
      const date = new Date(value);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    setEditingId(item.id ?? item.Id);
    setForm({
      name: item.name ?? item.Name ?? "",
      description: item.description ?? item.Description ?? "",
      startDate: toLocalInput(item.startDate ?? item.StartDate),
      endDate: toLocalInput(item.endDate ?? item.EndDate),
    });
    setShowForm(true);
  };
  const remove = async (id) => {
    if (!window.confirm("Xóa giải đấu này?")) return;
    try { await deleteTournament(id); setMessage("Đã xóa giải đấu."); load(); } catch (err) { setMessage(err.message); }
  };

  return (
    <>
      <PageTitle eyebrow="Quản lý giải đấu" title="Giải đấu" description="Tạo giải đấu và điều phối vòng đấu, cuộc đua." action={<button className="primary-button" onClick={() => { setEditingId(""); setForm({ name: "", description: "", startDate: inputDate(7), endDate: inputDate(14) }); setShowForm(!showForm); }}>Tạo giải đấu</button>} />
      <Notice message={message} />
      {showForm && <form className="admin-form" onSubmit={submit}><input placeholder="Tên giải đấu" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><input type="datetime-local" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /><input type="datetime-local" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /><button className="primary-button">Lưu giải đấu</button></form>}
      <section className="admin-card-grid">{items.map((item) => {
        const id = item.id ?? item.Id;
        return <article key={id} className="admin-tournament-card"><div><span className={(item.isActive ?? item.IsActive) ? "status status--active" : "status status--inactive"}>{(item.isActive ?? item.IsActive) ? "Hoạt động" : "Không hoạt động"}</span><h3>{item.name ?? item.Name}</h3><p>{item.description ?? item.Description ?? "Không có mô tả"}</p></div><dl><div><dt>Bắt đầu</dt><dd>{formatDate(item.startDate ?? item.StartDate)}</dd></div><div><dt>Vòng đấu</dt><dd>{item.roundCount ?? item.RoundCount ?? 0}</dd></div><div><dt>Cuộc đua</dt><dd>{item.raceCount ?? item.RaceCount ?? 0}</dd></div></dl><div className="admin-actions"><button onClick={() => edit(item)}>Sửa</button><button className="admin-danger" onClick={() => remove(id)}>Xóa</button></div></article>;
      })}</section>
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
  const [assignment, setAssignment] = useState({ raceId: "", horseId: "", jockeyId: "" });
  const [form, setForm] = useState(type === "round"
    ? { name: "", roundNumber: 1, scheduledStartDate: inputDate(7), scheduledEndDate: inputDate(8), description: "" }
    : { name: "", roundId: "", scheduledAt: inputDate(7), location: "", description: "", maxParticipants: 12, distance: 2000 });

  useEffect(() => { getAdminTournaments().then((data) => { const list = Array.isArray(data) ? data : []; setTournaments(list); setSelected(list[0]?.id ?? list[0]?.Id ?? ""); }).catch((err) => setMessage(err.message)); }, []);
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
    fetcher(selected).then((data) => setItems(Array.isArray(data) ? data : [])).catch((err) => setMessage(err.message));
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
    ? approvedHorses.filter(
        (horse) => {
          const jockeyIds =
            horse.assignedJockeyIds ?? horse.AssignedJockeyIds ?? [];
          return (
            jockeyIds.includes(assignment.jockeyId) ||
            (horse.assignedJockeyId ?? horse.AssignedJockeyId) ===
              assignment.jockeyId
          );
        },
      )
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
        await createRound(selected, { ...form, scheduledStartDate: new Date(form.scheduledStartDate).toISOString(), scheduledEndDate: new Date(form.scheduledEndDate).toISOString() });
        setItems(await getTournamentRounds(selected));
      } else {
        await createRace({ ...form, tournamentId: selected, roundId: form.roundId || null, scheduledAt: new Date(form.scheduledAt).toISOString(), maxParticipants: Number(form.maxParticipants), distance: Number(form.distance) });
        setItems(await getTournamentRaces(selected));
      }
      setMessage(`${type === "round" ? "Vòng đấu" : "Cuộc đua"} đã tạo thành công.`);
    } catch (err) { setMessage(err.message); }
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
    } catch (err) { setMessage(err.message); }
  };

  const handleRaceAction = async (raceId, action) => {
    const labels = { start: "bắt đầu", end: "kết thúc", cancel: "hủy" };
    if (!window.confirm(`${labels[action].charAt(0).toUpperCase() + labels[action].slice(1)} cuộc đua này?`)) return;
    try {
      if (action === "start") await startRace(raceId);
      else if (action === "end") await endRace(raceId);
      else if (action === "cancel") await cancelRace(raceId);
      setMessage(`Cuộc đua đã ${labels[action]} thành công.`);
      setItems(await getTournamentRaces(selected));
    } catch (err) { setMessage(err.message); }
  };

  const title = type === "round" ? "Quản lý vòng đấu" : "Quản lý cuộc đua & lên lịch";
  return (
    <>
      <PageTitle eyebrow="Quản lý giải đấu" title={title} description={type === "round" ? "Xây dựng giai đoạn giải đấu và xác định khung thời gian." : "Sắp xếp cuộc đua, đặt lịch và chuẩn bị phân công ngựa."} />
      <Notice message={message} />
      <div className="admin-select-row"><label>Giải đấu<select value={selected} onChange={(e) => setSelected(e.target.value)}>{tournaments.map((item) => <option key={item.id ?? item.Id} value={item.id ?? item.Id}>{item.name ?? item.Name}</option>)}</select></label></div>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder={`Tên ${type === "round" ? "vòng đấu" : "cuộc đua"}`} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {type === "round" ? <>
          <input type="number" min="1" value={form.roundNumber} onChange={(e) => setForm({ ...form, roundNumber: Number(e.target.value) })} />
          <input type="datetime-local" value={form.scheduledStartDate} onChange={(e) => setForm({ ...form, scheduledStartDate: e.target.value })} />
          <input type="datetime-local" value={form.scheduledEndDate} onChange={(e) => setForm({ ...form, scheduledEndDate: e.target.value })} />
        </> : <>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <input placeholder="Địa điểm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input type="number" min="1" placeholder="Số người tham gia tối đa" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
          <input type="number" min="100" placeholder="Khoảng cách (m)" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
        </>}
        <button className="primary-button" disabled={!selected}>Tạo {type === "round" ? "vòng đấu" : "cuộc đua"}</button>
      </form>
      {type === "race" && <form className="admin-form" onSubmit={assignHorse}>
        <select required value={assignment.raceId} onChange={(e) => setAssignment({ ...assignment, raceId: e.target.value })}>
          <option value="">Chọn cuộc đua để phân công ngựa</option>
          {items.map((item) => <option key={item.id ?? item.Id} value={item.id ?? item.Id}>{item.name ?? item.Name}</option>)}
        </select>
        <select required value={assignment.horseId} onChange={(e) => selectHorse(e.target.value)}>
          <option value="">Chọn ngựa đã được phê duyệt</option>
          {visibleHorses.map((horse) => {
            const jockeyName =
              horse.assignedJockeyName ?? horse.AssignedJockeyName;
            const assignmentStatus =
              horse.jockeyAssignmentStatus ?? horse.JockeyAssignmentStatus;
            return <option key={horse.id ?? horse.Id} value={horse.id ?? horse.Id}>{horse.name ?? horse.Name} · {jockeyName ? `${jockeyName} (${assignmentStatus || "Đã phân công"})` : "Không có kỵ sĩ"}</option>;
          })}
        </select>
        <select value={assignment.jockeyId} onChange={(e) => selectJockey(e.target.value)} disabled={Boolean(selectedHorseJockeyId)}>
          <option value="">Không có kỵ sĩ</option>
          {approvedJockeys.map((jockey) => <option key={jockey.id} value={jockey.id}>{jockey.fullName}</option>)}
        </select>
        <button className="primary-button" disabled={!assignment.raceId || !assignment.horseId}>Phân công ngựa</button>
      </form>}
      {type === "race" && selectedHorseJockeyId ? (
        <p className="admin-muted-note">
          Ngựa này được phân công cho {selectedHorseJockeyName || "kỵ sĩ đã chọn"}. Kỵ sĩ sẽ được thêm tự động.
        </p>
      ) : null}
      {type === "race" && approvedJockeys.length === 0 ? (
        <p className="admin-muted-note">
          Không có kỵ sĩ nào được phê duyệt. Hãy phê duyệt tài khoản kỵ sĩ trong Quản lý vai trò trước khi phân công vào cuộc đua.
        </p>
      ) : null}
      <section className="admin-card-grid">{items.map((item) => {
        const itemId = item.id ?? item.Id;
        const itemStatus = (item.status ?? item.Status ?? "").toLowerCase();
        return <article key={itemId} className="admin-simple-card">
          <span className="badge">{item.status ?? item.Status ?? `#${item.roundNumber ?? item.RoundNumber ?? ""}`}</span>
          <h3>{item.name ?? item.Name}</h3>
          <p>{formatDate(item.scheduledAt ?? item.ScheduledAt ?? item.scheduledStartDate ?? item.ScheduledStartDate)}</p>
          <small>{type === "round" ? `${item.raceCount ?? item.RaceCount ?? 0} cuộc đua` : `${item.entriesCount ?? item.EntriesCount ?? 0} ngựa đã phân công`}</small>
          {type === "race" && (
            <div className="admin-actions admin-race-actions">
              {itemStatus !== "inprogress" && itemStatus !== "finished" && (
                <button onClick={() => handleRaceAction(itemId, "start")} disabled={itemStatus === "cancelled"}>
                  Bắt đầu
                </button>
              )}
              {itemStatus === "inprogress" && (
                <button onClick={() => handleRaceAction(itemId, "end")}>
                  Kết thúc
                </button>
              )}
              {itemStatus !== "finished" && itemStatus !== "cancelled" && (
                <button className="admin-danger" onClick={() => handleRaceAction(itemId, "cancel")}>
                  Hủy
                </button>
              )}
            </div>
          )}
        </article>;
      })}</section>
    </>
  );
}

function RegistrationManagement() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const load = () =>
    getPendingRegistrations()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setMessage(err.message));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    items.filter((item) => {
      const search = `${item.fullName ?? item.FullName ?? ""} ${item.email ?? item.Email ?? ""} ${item.requestedRole ?? item.RequestedRole ?? ""}`.toLowerCase();
      return search.includes(query.toLowerCase());
    }),
  [query, items]);

  const approve = async (registration) => {
    const id = registration.id ?? registration.Id;
    try {
      await approveRegistration(id);
      setMessage("Đăng ký đã được phê duyệt.");
      load();
    } catch (err) { setMessage(err.message); }
  };

  const reject = async (registration) => {
    const id = registration.id ?? registration.Id;
    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return;
    try {
      await rejectRegistration(id, reason || "Bị từ chối bởi quản trị viên");
      setMessage("Đăng ký đã bị từ chối.");
      load();
    } catch (err) { setMessage(err.message); }
  };

  return (
    <>
      <PageTitle eyebrow="Quản lý người dùng" title="Phê duyệt đăng ký" description="Xem xét và phê duyệt đăng ký người dùng mới trước khi họ có thể truy cập nền tảng." />
      <div className="admin-toolbar">
        <input placeholder="Tìm kiếm theo tên, email hoặc vai trò..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <span>{filtered.length} đang chờ</span>
      </div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
          <tbody>
            {filtered.map((item) => {
              const id = item.id ?? item.Id;
              const status = item.status ?? item.Status ?? "Pending";
              return (
                <tr key={id}>
                  <td><strong>{item.fullName ?? item.FullName ?? "N/A"}</strong></td>
                  <td>{item.email ?? item.Email}</td>
                  <td>{item.requestedRole ?? item.RequestedRole}</td>
                  <td><span className={`status status--${status.toLowerCase()}`}>{status}</span></td>
                  <td>{formatDate(item.createdAt ?? item.CreatedAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button disabled={status !== "Pending"} onClick={() => approve(item)}>Phê duyệt</button>
                      <button className="admin-danger" disabled={status !== "Pending"} onClick={() => reject(item)}>Từ chối</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6}>Không tìm thấy đăng ký đang chờ nào.</td></tr>
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
  else if (location.pathname === "/admin/registrations") content = <RegistrationManagement />;
  else if (location.pathname.includes("/horses/")) content = <HorseDetail />;
  else if (location.pathname.startsWith("/admin/users/")) content = <UserDetail />;
  else if (location.pathname === "/admin/roles") content = <Roles />;
  else if (location.pathname === "/admin/tournaments") content = <TournamentManagement />;
  else if (location.pathname === "/admin/rounds") content = <ScheduleManagement type="round" />;
  else if (location.pathname === "/admin/races") content = <ScheduleManagement type="race" />;
  else if (location.pathname === "/admin/prizes") content = <PrizeManagement />;
  else if (location.pathname === "/admin/protests") content = <ProtestManagement />;
  else if (location.pathname === "/admin/transfers") content = <TransferManagement />;
  else if (location.pathname === "/admin/contracts") content = <ContractManagement />;
  else if (location.pathname === "/admin/injuries") content = <InjuryManagement />;
  else if (location.pathname === "/admin/audit") content = <AuditLogViewer />;
  else if (location.pathname === "/admin/notifications") content = <NotificationManager />;

  return <AdminShell>{content}</AdminShell>;
}

export default AdminPage;
