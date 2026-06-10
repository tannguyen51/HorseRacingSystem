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
import {
  PrizeManagement,
  ProtestManagement,
  TransferManagement,
  ContractManagement,
  InjuryManagement,
} from "./AdminOperations";
import { AuditLogViewer, NotificationManager } from "./AdminAudit";
import "./AdminPage.css";

const navGroups = [
  { label: "Overview", items: [{ to: "/admin", label: "Dashboard", end: true }] },
  {
    label: "User Management",
    items: [
      { to: "/admin/users", label: "User List" },
      { to: "/admin/registrations", label: "Registrations" },
      { to: "/admin/roles", label: "Role Management" },
    ],
  },
  {
    label: "Tournament Management",
    items: [
      { to: "/admin/tournaments", label: "Tournaments" },
      { to: "/admin/rounds", label: "Rounds" },
      { to: "/admin/races", label: "Races & Scheduling" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/prizes", label: "Prize Money" },
      { to: "/admin/protests", label: "Protests" },
      { to: "/admin/transfers", label: "Horse Transfers" },
      { to: "/admin/contracts", label: "Contracts" },
      { to: "/admin/injuries", label: "Injury Records" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/audit", label: "Audit Logs" },
      { to: "/admin/notifications", label: "Notifications" },
    ],
  },
];

const roleCards = [
  ["Admin", "Full system control and management access"],
  ["Referee", "Race control, validation, and result duties"],
  ["HorseOwner", "Horse stable and tournament registration"],
  ["Jockey", "Invitations, schedules, and performance"],
  ["Spectator", "Schedules, rankings, predictions, and rewards"],
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
          <span className="pill">Admin</span>
          <h3>Control center</h3>
          <p>Operate users, tournaments, rounds, and race schedules.</p>
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
    ["Total users", data?.totalUsers ?? data?.TotalUsers ?? "-"],
    ["Active tournaments", data?.activeTournaments ?? data?.ActiveTournaments ?? "-"],
    ["Live races", data?.ongoingRaces ?? data?.OngoingRaces ?? "-"],
    ["Upcoming races", data?.upcomingRaces ?? data?.UpcomingRaces ?? "-"],
  ];

  return (
    <>
      <PageTitle eyebrow="Admin Dashboard" title="System overview" description="Monitor platform activity and keep racing operations moving." />
      <Notice message={error} error />
      <section className="admin-stat-grid">
        {stats.map(([label, value]) => (
          <article key={label} className="admin-stat-card">
            <span>{label}</span><strong>{value}</strong><small>Live platform data</small>
          </article>
        ))}
      </section>
      <section className="admin-panel-grid">
        <article className="admin-panel">
          <div className="admin-panel__heading"><div><span>System analytics</span><h2>Operations health</h2></div></div>
          <div className="admin-bars">
            {[["User activity", 82], ["Tournament capacity", 68], ["Race scheduling", 74], ["Platform availability", 99]].map(([label, value]) => (
              <div key={label}><p><span>{label}</span><strong>{value}%</strong></p><div><i style={{ width: `${value}%` }} /></div></div>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <div className="admin-panel__heading"><div><span>Attention needed</span><h2>Admin queue</h2></div></div>
          <div className="admin-queue">
            <div><strong>{data?.pendingRegistrations ?? data?.PendingRegistrations ?? "-"}</strong><span>Pending registrations</span></div>
            <div><strong>{data?.totalReferees ?? data?.TotalReferees ?? "-"}</strong><span>Available referees</span></div>
            <div><strong>{data?.upcomingRaces ?? data?.UpcomingRaces ?? "-"}</strong><span>Races to coordinate</span></div>
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
      setMessage(`User ${active ? "banned" : "reactivated"} successfully.`);
      load();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle eyebrow="User Management" title="User list" description="Search accounts, inspect details, and control account access." />
      <div className="admin-toolbar"><input placeholder="Search users, email, or role..." value={query} onChange={(e) => setQuery(e.target.value)} /><span>{filtered.length} users</span></div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map((user) => {
            const id = user.id ?? user.Id;
            const active = user.isActive ?? user.IsActive;
            return <tr key={id}>
              <td><strong>{user.fullName ?? user.FullName ?? "Unnamed user"}</strong><small>{user.email ?? user.Email}</small></td>
              <td>{user.role ?? user.Role}</td><td>{formatDate(user.createdAt ?? user.CreatedAt)}</td>
              <td><span className={active ? "status status--active" : "status status--inactive"}>{active ? "Active" : "Banned"}</span></td>
              <td><div className="admin-actions"><button onClick={() => navigate(`/admin/users/${id}`)}>Detail</button><button onClick={() => toggle(user)}>{active ? "Ban" : "Unban"}</button></div></td>
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
      setMessage(`Account ${active ? "banned" : "reactivated"} successfully.`);
    } catch (err) { setMessage(err.message); }
  };

  const changeHorseStatus = async (horse, status) => {
    let note = null;
    if (status === "Rejected") {
      note = window.prompt("Enter a rejection reason:");
      if (!note?.trim()) return;
    }

    try {
      await updateOwnerHorseStatus(id, horse.id ?? horse.Id, { status, note });
      setMessage(`${horse.name ?? horse.Name} changed to ${status}.`);
      const horseData = await getOwnerHorses(id);
      setHorses(Array.isArray(horseData) ? horseData : []);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle eyebrow="User Management" title="User detail" description="Review account information and access status." action={<button className="ghost-button" onClick={() => navigate("/admin/users")}>Back to users</button>} />
      <Notice message={message} />
      <article className="admin-profile">
        <div className="admin-profile__avatar">{(user?.fullName ?? user?.FullName ?? "U").slice(0, 1)}</div>
        <div><span className={active ? "status status--active" : "status status--inactive"}>{active ? "Active" : "Banned"}</span><h2>{user?.fullName ?? user?.FullName ?? "Loading..."}</h2><p>{user?.email ?? user?.Email}</p></div>
        <button className="primary-button" onClick={toggle} disabled={!user}>{active ? "Ban user" : "Unban user"}</button>
      </article>
      <section className="admin-detail-grid">
        <div><span>Role</span><strong>{role ?? "-"}</strong></div>
        <div><span>Created at</span><strong>{formatDate(user?.createdAt ?? user?.CreatedAt)}</strong></div>
        <div><span>Registered horses</span><strong>{user?.horseCount ?? user?.HorseCount ?? 0}</strong></div>
        <div><span>User ID</span><strong>{id}</strong></div>
      </section>
      {role === "HorseOwner" && <>
        <div className="section-heading">
          <h2>Owner horses</h2>
          <p>Review and change approval status for each horse.</p>
        </div>
        <section className="admin-horse-grid">
          {horses.map((horse) => {
            const status = horse.approvalStatus ?? horse.ApprovalStatus;
            return <article key={horse.id ?? horse.Id} className="admin-horse-card">
              <div>
                <span className={`status status--${status?.toLowerCase()}`}>{status}</span>
                <h3>{horse.name ?? horse.Name}</h3>
                <p>{horse.breed ?? horse.Breed ?? "Unknown breed"} · {horse.gender ?? horse.Gender ?? "Unknown gender"} · Age {horse.age ?? horse.Age}</p>
              </div>
              <div className="admin-horse-card__stats">
                <span>{horse.totalRaces ?? horse.TotalRaces} races</span>
                <span>{horse.totalWins ?? horse.TotalWins} wins</span>
              </div>
              {(horse.approvalNote ?? horse.ApprovalNote) && <p className="admin-horse-card__note">{horse.approvalNote ?? horse.ApprovalNote}</p>}
              <button className="admin-horse-card__detail" onClick={() => navigate(`/admin/users/${id}/horses/${horse.id ?? horse.Id}`)}>View detail</button>
              <div className="admin-actions admin-horse-card__actions">
                {["Pending", "Approved", "Rejected"].map((nextStatus) => <button key={nextStatus} disabled={status === nextStatus} onClick={() => changeHorseStatus(horse, nextStatus)}>{nextStatus}</button>)}
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
        eyebrow="Horse Management"
        title="Horse detail"
        description="Review complete horse information and ownership data."
        action={<button className="ghost-button" onClick={() => navigate(`/admin/users/${userId}`)}>Back to owner</button>}
      />
      <Notice message={message} error />
      {horse && <section className="admin-horse-detail">
        <article className="admin-horse-detail__hero">
          <div className="admin-horse-detail__image">
            {value("imageUrl", "ImageUrl", "") ? <img src={value("imageUrl", "ImageUrl", "")} alt={value("name", "Name")} /> : <span>{value("name", "Name", "H").slice(0, 1)}</span>}
          </div>
          <div>
            <span className={`status status--${status.toLowerCase()}`}>{status}</span>
            <h2>{value("name", "Name")}</h2>
            <p>{value("breed", "Breed", "Unknown breed")} · {value("gender", "Gender", "Unknown gender")} · {value("color", "Color", "Unknown color")}</p>
          </div>
        </article>
        <section className="admin-horse-detail__grid">
          <div><span>Owner</span><strong>{value("ownerName", "OwnerName")}</strong></div>
          <div><span>Age</span><strong>{value("age", "Age")}</strong></div>
          <div><span>Date of birth</span><strong>{formatDate(value("dateOfBirth", "DateOfBirth", null))}</strong></div>
          <div><span>Weight</span><strong>{value("weight", "Weight")} kg</strong></div>
          <div><span>Height</span><strong>{value("height", "Height")} cm</strong></div>
          <div><span>Total races</span><strong>{value("totalRaces", "TotalRaces", 0)}</strong></div>
          <div><span>Total wins</span><strong>{value("totalWins", "TotalWins", 0)}</strong></div>
          <div><span>Win rate</span><strong>{value("totalRaces", "TotalRaces", 0) ? `${Math.round((value("totalWins", "TotalWins", 0) / value("totalRaces", "TotalRaces", 0)) * 100)}%` : "0%"}</strong></div>
          <div><span>Horse ID</span><strong>{horseId}</strong></div>
          <div><span>Owner ID</span><strong>{value("ownerId", "OwnerId")}</strong></div>
        </section>
        {(value("approvalNote", "ApprovalNote", "")) && <article className="admin-horse-detail__note"><span>Approval note</span><p>{value("approvalNote", "ApprovalNote")}</p></article>}
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
        const reason = window.prompt("Reason for rejecting this jockey?");
        if (reason === null) return;
        await rejectJockey(jockey.id, reason || "Rejected by admin");
      }

      setMessage(
        `${jockey.fullName} ${approved ? "approved" : "rejected"} successfully.`,
      );
      loadJockeys();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <PageTitle eyebrow="User Management" title="Role management" description="Understand permission boundaries across the RaceMaster platform." />
      <Notice message={message} />
      <section className="admin-role-grid">{roleCards.map(([role, detail]) => <article key={role}><span>{role.slice(0, 1)}</span><h3>{role}</h3><p>{detail}</p><button disabled>Assign via backend role API</button></article>)}</section>
      <p className="admin-muted-note">Role assignment is displayed as unavailable because the current backend has no role update endpoint.</p>
      <section className="admin-panel">
        <div className="admin-panel__heading">
          <span>Jockey Management</span>
          <h2>Jockey approval</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Jockey</th>
                <th>License</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jockeys.map((jockey) => {
                const status = jockey.approvalStatusName || "Unknown";
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
                          Approve
                        </button>
                        <button
                          className="admin-danger"
                          disabled={status === "Rejected"}
                          onClick={() => updateJockeyStatus(jockey, false)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {jockeys.length === 0 ? (
                <tr>
                  <td colSpan="4">No jockey accounts found.</td>
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
      setMessage(`Tournament ${editingId ? "updated" : "created"} successfully.`);
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
    if (!window.confirm("Delete this tournament?")) return;
    try { await deleteTournament(id); setMessage("Tournament deleted."); load(); } catch (err) { setMessage(err.message); }
  };

  return (
    <>
      <PageTitle eyebrow="Tournament Management" title="Tournaments" description="Create tournaments and coordinate their rounds and races." action={<button className="primary-button" onClick={() => { setEditingId(""); setForm({ name: "", description: "", startDate: inputDate(7), endDate: inputDate(14) }); setShowForm(!showForm); }}>Create tournament</button>} />
      <Notice message={message} />
      {showForm && <form className="admin-form" onSubmit={submit}><input placeholder="Tournament name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><input type="datetime-local" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /><input type="datetime-local" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /><button className="primary-button">Save tournament</button></form>}
      <section className="admin-card-grid">{items.map((item) => {
        const id = item.id ?? item.Id;
        return <article key={id} className="admin-tournament-card"><div><span className={(item.isActive ?? item.IsActive) ? "status status--active" : "status status--inactive"}>{(item.isActive ?? item.IsActive) ? "Active" : "Inactive"}</span><h3>{item.name ?? item.Name}</h3><p>{item.description ?? item.Description ?? "No description"}</p></div><dl><div><dt>Start</dt><dd>{formatDate(item.startDate ?? item.StartDate)}</dd></div><div><dt>Rounds</dt><dd>{item.roundCount ?? item.RoundCount ?? 0}</dd></div><div><dt>Races</dt><dd>{item.raceCount ?? item.RaceCount ?? 0}</dd></div></dl><div className="admin-actions"><button onClick={() => edit(item)}>Edit</button><button className="admin-danger" onClick={() => remove(id)}>Delete</button></div></article>;
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
      setMessage(`${type === "round" ? "Round" : "Race"} created successfully.`);
    } catch (err) { setMessage(err.message); }
  };

  const assignHorse = async (event) => {
    event.preventDefault();
    const horseId = assignment.horseId.trim();
    const jockeyId = assignment.jockeyId.trim();

    if (!isGuid(horseId)) {
      setMessage("Horse ID must be a valid GUID.");
      return;
    }

    if (jockeyId && !isGuid(jockeyId)) {
      setMessage("Jockey ID must be a valid GUID or left empty.");
      return;
    }

    try {
      await assignHorseToRace(assignment.raceId, {
        horseId,
        jockeyId: jockeyId || null,
      });
      setMessage("Horse assigned to race successfully.");
      setAssignment({ raceId: "", horseId: "", jockeyId: "" });
      setItems(await getTournamentRaces(selected));
    } catch (err) { setMessage(err.message); }
  };

  const handleRaceAction = async (raceId, action) => {
    const labels = { start: "start", end: "end", cancel: "cancel" };
    if (!window.confirm(`${labels[action].charAt(0).toUpperCase() + labels[action].slice(1)} this race?`)) return;
    try {
      if (action === "start") await startRace(raceId);
      else if (action === "end") await endRace(raceId);
      else if (action === "cancel") await cancelRace(raceId);
      setMessage(`Race ${labels[action]}ed successfully.`);
      setItems(await getTournamentRaces(selected));
    } catch (err) { setMessage(err.message); }
  };

  const title = type === "round" ? "Round management" : "Race management & scheduling";
  return (
    <>
      <PageTitle eyebrow="Tournament Management" title={title} description={type === "round" ? "Build tournament stages and define their date windows." : "Arrange races, set schedules, and prepare horse assignments."} />
      <Notice message={message} />
      <div className="admin-select-row"><label>Tournament<select value={selected} onChange={(e) => setSelected(e.target.value)}>{tournaments.map((item) => <option key={item.id ?? item.Id} value={item.id ?? item.Id}>{item.name ?? item.Name}</option>)}</select></label></div>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder={`${type === "round" ? "Round" : "Race"} name`} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        {type === "round" ? <>
          <input type="number" min="1" value={form.roundNumber} onChange={(e) => setForm({ ...form, roundNumber: Number(e.target.value) })} />
          <input type="datetime-local" value={form.scheduledStartDate} onChange={(e) => setForm({ ...form, scheduledStartDate: e.target.value })} />
          <input type="datetime-local" value={form.scheduledEndDate} onChange={(e) => setForm({ ...form, scheduledEndDate: e.target.value })} />
        </> : <>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input type="number" min="1" placeholder="Max participants" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
          <input type="number" min="100" placeholder="Distance (m)" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
        </>}
        <button className="primary-button" disabled={!selected}>Create {type}</button>
      </form>
      {type === "race" && <form className="admin-form" onSubmit={assignHorse}>
        <select required value={assignment.raceId} onChange={(e) => setAssignment({ ...assignment, raceId: e.target.value })}>
          <option value="">Select race for horse assignment</option>
          {items.map((item) => <option key={item.id ?? item.Id} value={item.id ?? item.Id}>{item.name ?? item.Name}</option>)}
        </select>
        <select required value={assignment.horseId} onChange={(e) => selectHorse(e.target.value)}>
          <option value="">Select approved horse</option>
          {visibleHorses.map((horse) => {
            const jockeyName =
              horse.assignedJockeyName ?? horse.AssignedJockeyName;
            const assignmentStatus =
              horse.jockeyAssignmentStatus ?? horse.JockeyAssignmentStatus;
            return <option key={horse.id ?? horse.Id} value={horse.id ?? horse.Id}>{horse.name ?? horse.Name} · {jockeyName ? `${jockeyName} (${assignmentStatus || "Assigned"})` : "No jockey"}</option>;
          })}
        </select>
        <select value={assignment.jockeyId} onChange={(e) => selectJockey(e.target.value)} disabled={Boolean(selectedHorseJockeyId)}>
          <option value="">No jockey</option>
          {approvedJockeys.map((jockey) => <option key={jockey.id} value={jockey.id}>{jockey.fullName}</option>)}
        </select>
        <button className="primary-button" disabled={!assignment.raceId || !assignment.horseId}>Assign horse</button>
      </form>}
      {type === "race" && selectedHorseJockeyId ? (
        <p className="admin-muted-note">
          This horse is assigned to {selectedHorseJockeyName || "the selected jockey"}. The jockey will be added automatically.
        </p>
      ) : null}
      {type === "race" && approvedJockeys.length === 0 ? (
        <p className="admin-muted-note">
          No approved jockeys are available. Approve jockey accounts in Role Management before assigning one to a race.
        </p>
      ) : null}
      <section className="admin-card-grid">{items.map((item) => {
        const itemId = item.id ?? item.Id;
        const itemStatus = (item.status ?? item.Status ?? "").toLowerCase();
        return <article key={itemId} className="admin-simple-card">
          <span className="badge">{item.status ?? item.Status ?? `#${item.roundNumber ?? item.RoundNumber ?? ""}`}</span>
          <h3>{item.name ?? item.Name}</h3>
          <p>{formatDate(item.scheduledAt ?? item.ScheduledAt ?? item.scheduledStartDate ?? item.ScheduledStartDate)}</p>
          <small>{type === "round" ? `${item.raceCount ?? item.RaceCount ?? 0} races` : `${item.entriesCount ?? item.EntriesCount ?? 0} assigned horses`}</small>
          {type === "race" && (
            <div className="admin-actions admin-race-actions">
              {itemStatus !== "inprogress" && itemStatus !== "finished" && (
                <button onClick={() => handleRaceAction(itemId, "start")} disabled={itemStatus === "cancelled"}>
                  Start
                </button>
              )}
              {itemStatus === "inprogress" && (
                <button onClick={() => handleRaceAction(itemId, "end")}>
                  End
                </button>
              )}
              {itemStatus !== "finished" && itemStatus !== "cancelled" && (
                <button className="admin-danger" onClick={() => handleRaceAction(itemId, "cancel")}>
                  Cancel
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
      setMessage("Registration approved.");
      load();
    } catch (err) { setMessage(err.message); }
  };

  const reject = async (registration) => {
    const id = registration.id ?? registration.Id;
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return;
    try {
      await rejectRegistration(id, reason || "Rejected by admin");
      setMessage("Registration rejected.");
      load();
    } catch (err) { setMessage(err.message); }
  };

  return (
    <>
      <PageTitle eyebrow="User Management" title="Registration approvals" description="Review and approve new user registrations before they can access the platform." />
      <div className="admin-toolbar">
        <input placeholder="Search by name, email, or role..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <span>{filtered.length} pending</span>
      </div>
      <Notice message={message} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
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
                      <button disabled={status !== "Pending"} onClick={() => approve(item)}>Approve</button>
                      <button className="admin-danger" disabled={status !== "Pending"} onClick={() => reject(item)}>Reject</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6}>No pending registrations found.</td></tr>
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
