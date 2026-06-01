import { useNavigate } from "react-router-dom";
import "../OwnerSharedLayout.css";
import "./OwnerDashboardPage.css";

const stats = [
  { label: "Total horses", value: "12", trend: "+2 this month" },
  { label: "Active races", value: "3", trend: "2 upcoming" },
  { label: "Total prize money", value: "$185,400", trend: "+12%" },
  { label: "Pending confirmations", value: "2", trend: "Due this week" },
];

const upcomingRaces = [
  {
    title: "Coastal Derby",
    time: "May 22 · 4:20 PM",
    track: "Gulfstream Park",
    horse: "Silver Comet",
  },
  {
    title: "Emerald Invitational",
    time: "May 24 · 2:40 PM",
    track: "Emerald Downs",
    horse: "Thunder Strike",
  },
  {
    title: "Golden Mile",
    time: "May 28 · 5:10 PM",
    track: "Santa Anita",
    horse: "Midnight Runner",
  },
];

const notifications = [
  {
    title: "Health check scheduled",
    detail: "Thunder Strike vet visit on May 20.",
    time: "2 hours ago",
  },
  {
    title: "Registration approved",
    detail: "Silver Comet entered into Coastal Derby.",
    time: "Yesterday",
  },
  {
    title: "Jockey confirmed",
    detail: "Ariana Blake assigned to Midnight Runner.",
    time: "May 16",
  },
];

const activityFeed = [
  {
    title: "Race result posted",
    detail: "Thunder Strike placed 2nd in Spring Showcase.",
    time: "May 14",
  },
  {
    title: "Performance update",
    detail: "Silver Comet speed rating improved to 91.",
    time: "May 12",
  },
  {
    title: "Training log",
    detail: "Midnight Runner completed endurance session.",
    time: "May 11",
  },
];

const performanceSummary = [
  { label: "Win rate", value: "38%" },
  { label: "Top 3 finishes", value: "64%" },
  { label: "Avg speed", value: "92" },
];

const tournamentParticipation = [
  {
    name: "Spring Championship Finals",
    horses: "2 horses",
    status: "Live",
    prize: "$500,000",
  },
  {
    name: "Pacific Classic Series",
    horses: "1 horse",
    status: "Open",
    prize: "$320,000",
  },
];

const quickActions = [
  {
    title: "Add a new horse",
    description: "Upload records and track performance stats.",
  },
  {
    title: "Register for tournament",
    description: "Check eligibility and reserve slots.",
  },
  {
    title: "Confirm race entry",
    description: "Approve upcoming race participation.",
  },
];

const chartData = [
  { label: "Speed", value: 92 },
  { label: "Stamina", value: 86 },
  { label: "Consistency", value: 78 },
  { label: "Sprint", value: 88 },
];

function OwnerDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="owner-page owner-dashboard">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Stable overview</h3>
            <p className="muted">Track horses, entries, and rewards.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Next obligation</p>
            <h4>Race confirmation</h4>
            <span>Due in 18 hours</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Prize money YTD</p>
            <h4>$185,400</h4>
            <span>Updated today</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="owner-hero">
            <div>
              <span className="pill">Owner dashboard</span>
              <h1>Welcome back, Evelyn</h1>
              <p>
                Manage your stable, monitor race entries, and keep every horse
                race-ready.
              </p>
              <div className="owner-hero__actions">
                <button className="primary-button" onClick={() => navigate("/owner/horses/new")}>Add horse</button>
                <button className="ghost-button">Register tournament</button>
              </div>
            </div>
            <div className="owner-hero__panel">
              <div>
                <span>Horses ready</span>
                <strong>9</strong>
              </div>
              <div>
                <span>Upcoming races</span>
                <strong>3</strong>
              </div>
              <div>
                <span>Pending approvals</span>
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
                <h2>Upcoming races</h2>
                <p>Confirm entries and align your jockey lineup.</p>
              </div>
              <div className="owner-card-grid">
                {upcomingRaces.map((race) => (
                  <article
                    key={race.title}
                    className="owner-upcoming-card hover-lift"
                  >
                    <div className="owner-upcoming-card__header">
                      <span className="badge">Upcoming</span>
                      <span className="muted">{race.time}</span>
                    </div>
                    <h3>{race.title}</h3>
                    <p>{race.track}</p>
                    <div className="owner-upcoming-card__meta">
                      <span>Horse</span>
                      <strong>{race.horse}</strong>
                    </div>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Recent tournaments</h2>
                <p>Track where your horses are participating.</p>
              </div>
              <div className="tournament-stack">
                {tournamentParticipation.map((item) => (
                  <article key={item.name} className="owner-tournament-card">
                    <div className="owner-tournament-card__header">
                      <span className="badge">{item.status}</span>
                      <span className="owner-prize">{item.prize}</span>
                    </div>
                    <h3>{item.name}</h3>
                    <p className="muted">{item.horses}</p>
                    <div className="owner-tournament-meta">
                      <span>Entry status</span>
                      <strong>Confirmed</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="owner-stack">
              <div className="section-heading">
                <h2>Notifications</h2>
                <p>Priority updates from your owner operations.</p>
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
                <h2>Horse performance</h2>
                <p>Last 30 days performance summary.</p>
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
              <h2>Recent race activity</h2>
              <p>Latest updates from your stable activity feed.</p>
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
              <h2>Quick actions</h2>
              <p>Jump straight into your most common tasks.</p>
            </div>
            <div className="quick-action-grid">
              {quickActions.map((action) => (
                <article key={action.title} className="quick-action-card">
                  <h4>{action.title}</h4>
                  <p className="muted">{action.description}</p>
                  <button
                    className="ghost-button"
                    onClick={() => {
                      if (action.title === "Add a new horse") navigate("/owner/horses/new");
                    }}
                  >
                    Open
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