import "./SpectatorDashboardPage.css";

const stats = [
  { label: "Live viewers", value: "18.4K", trend: "+12%" },
  { label: "Active predictions", value: "2,148", trend: "+6%" },
  { label: "Reward pool", value: "$82,500", trend: "+3%" },
  { label: "Win streak", value: "4 races", trend: "Stable" },
];

const liveRaces = [
  {
    title: "Bluegrass Sprint",
    track: "Churchill Downs",
    lap: "Lap 3/6",
    leader: "Thunder Strike",
    time: "1:22.9",
    status: "Live",
  },
  {
    title: "Coastal Derby",
    track: "Gulfstream Park",
    lap: "Lap 2/5",
    leader: "Silver Comet",
    time: "0:58.4",
    status: "Live",
  },
  {
    title: "Golden Mile",
    track: "Santa Anita",
    lap: "Final stretch",
    leader: "Midnight Runner",
    time: "1:35.6",
    status: "Live",
  },
];

const featuredTournaments = [
  {
    name: "Spring Championship Finals",
    date: "May 24, 2026",
    races: 12,
    prize: "$500,000",
    status: "Live",
  },
  {
    name: "Pacific Classic Series",
    date: "June 12, 2026",
    races: 9,
    prize: "$320,000",
    status: "Open",
  },
];

const upcomingRaces = [
  {
    title: "Emerald Invitational",
    time: "Today · 5:10 PM",
    track: "Emerald Downs",
  },
  {
    title: "Capital Cup",
    time: "Tomorrow · 2:00 PM",
    track: "Laurel Park",
  },
  {
    title: "Harbor Stakes",
    time: "May 18 · 3:40 PM",
    track: "Del Mar",
  },
];

const recentActivity = [
  {
    title: "Prediction settled",
    detail: "Thunder Strike placed 1st in Bluegrass Sprint.",
    time: "12 mins ago",
  },
  {
    title: "Reward unlocked",
    detail: "You earned a 1.2x multiplier for 3 correct picks.",
    time: "42 mins ago",
  },
  {
    title: "Live race update",
    detail: "Golden Mile entering final stretch.",
    time: "1 hour ago",
  },
];

const leaderboardRows = [
  {
    rank: 1,
    player: "Ariana Blake",
    accuracy: "78%",
    streak: "6",
    rewards: "$4,250",
  },
  {
    rank: 2,
    player: "Drew Hamilton",
    accuracy: "74%",
    streak: "5",
    rewards: "$3,980",
  },
  {
    rank: 3,
    player: "Maya Ortiz",
    accuracy: "72%",
    streak: "4",
    rewards: "$3,620",
  },
  {
    rank: 4,
    player: "Sebastian Cole",
    accuracy: "70%",
    streak: "3",
    rewards: "$3,210",
  },
];

const sidebarLinks = [
  { label: "Dashboard", href: "/spectator" },
  { label: "Tournaments", href: "/spectator/tournaments" },
];

function SpectatorDashboardPage() {
  const showLoadingMore = true;
  const recentPredictions = [];

  return (
    <div className="spectator-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Race Day Hub</h3>
            <p className="muted">Track live action and rewards.</p>
          </div>
          <nav className="spectator-nav">
            {sidebarLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="spectator-nav__link"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="spectator-sidebar__card">
            <p className="muted">Next live window</p>
            <h4>Bluegrass Sprint</h4>
            <span>Starts in 08:12</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="spectator-hero">
            <div>
              <span className="pill">Live tournament</span>
              <h1>Spring Championship Finals</h1>
              <p>
                Watch the championship race live from Churchill Downs with
                real-time predictions and rewards.
              </p>
              <div className="spectator-hero__actions">
                <button className="primary-button">Watch Live</button>
                <button className="ghost-button">View Bracket</button>
              </div>
            </div>
            <div className="spectator-hero__panel">
              <div>
                <span>Live viewers</span>
                <strong>18,421</strong>
              </div>
              <div>
                <span>Prize pool</span>
                <strong>$500,000</strong>
              </div>
              <div>
                <span>Next race</span>
                <strong>Heat 5</strong>
              </div>
            </div>
          </section>

          <section className="spectator-stats">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card hover-lift">
                <p className="muted">{stat.label}</p>
                <h3>{stat.value}</h3>
                <span className="stat-trend">{stat.trend}</span>
              </article>
            ))}
          </section>

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Live races</h2>
              <p>Jump into the action and follow every split.</p>
            </div>
            <div className="live-grid">
              {liveRaces.map((race) => (
                <article key={race.title} className="live-card hover-lift">
                  <div className="live-card__header">
                    <span className="badge">{race.status}</span>
                    <span className="muted">{race.lap}</span>
                  </div>
                  <h3>{race.title}</h3>
                  <p>{race.track}</p>
                  <div className="live-card__meta">
                    <div>
                      <span>Leader</span>
                      <strong>{race.leader}</strong>
                    </div>
                    <div>
                      <span>Time</span>
                      <strong>{race.time}</strong>
                    </div>
                  </div>
                </article>
              ))}
              {showLoadingMore ? (
                <article className="live-card skeleton-card">
                  <div className="skeleton-line" />
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line" />
                </article>
              ) : null}
            </div>
          </section>

          <section className="spectator-columns">
            <div className="spectator-stack">
              <div className="section-heading">
                <h2>Featured tournaments</h2>
                <p>Hand-picked tournaments to keep on your radar.</p>
              </div>
              <div className="tournament-stack">
                {featuredTournaments.map((tournament) => (
                  <article
                    key={tournament.name}
                    className="tournament-card hover-lift"
                  >
                    <div className="tournament-card__header">
                      <span className="badge">{tournament.status}</span>
                      <span className="prize">{tournament.prize}</span>
                    </div>
                    <h3>{tournament.name}</h3>
                    <p>{tournament.date}</p>
                    <div className="tournament-meta">
                      <span>{tournament.races} races</span>
                      <button className="ghost-button">View details</button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Upcoming races</h2>
                <p>Track the next events you should not miss.</p>
              </div>
              <div className="upcoming-grid">
                {upcomingRaces.map((race) => (
                  <article key={race.title} className="mini-card hover-lift">
                    <h4>{race.title}</h4>
                    <p className="muted">{race.time}</p>
                    <span>{race.track}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="spectator-stack">
              <div className="reward-card">
                <div>
                  <span className="pill">Prediction rewards</span>
                  <h3>$1,840 earned</h3>
                  <p className="muted">
                    Weekly earnings from verified predictions.
                  </p>
                </div>
                <div className="reward-grid">
                  <div>
                    <strong>12</strong>
                    <span>Correct picks</span>
                  </div>
                  <div>
                    <strong>78%</strong>
                    <span>Accuracy</span>
                  </div>
                  <div>
                    <strong>4x</strong>
                    <span>Active boosts</span>
                  </div>
                </div>
              </div>

              <div className="recent-panel">
                <div className="section-heading">
                  <h2>Recent predictions</h2>
                  <p>Your latest prediction activity.</p>
                </div>
                {recentPredictions.length === 0 ? (
                  <div className="empty-state">
                    <h4>No predictions yet</h4>
                    <p>
                      Start following a live race to submit your first pick.
                    </p>
                    <button className="primary-button">
                      Explore live races
                    </button>
                  </div>
                ) : (
                  <div className="prediction-list">
                    {recentPredictions.map((prediction) => (
                      <article key={prediction.id} className="mini-card">
                        <h4>{prediction.race}</h4>
                        <p className="muted">{prediction.pick}</p>
                        <span>{prediction.time}</span>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Recent activity</h2>
              <p>Latest updates from your spectator feed.</p>
            </div>
            <div className="activity-panel">
              {recentActivity.map((activity) => (
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

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Live leaderboard</h2>
              <p>Top predictors climbing the live standings.</p>
            </div>
            <div className="leaderboard-table">
              <div className="table-row table-header">
                <span>Rank</span>
                <span>Predictor</span>
                <span>Accuracy</span>
                <span>Streak</span>
                <span>Rewards</span>
              </div>
              {leaderboardRows.map((row) => (
                <div key={row.rank} className="table-row">
                  <span className="rank-pill">{row.rank}</span>
                  <span>{row.player}</span>
                  <span className="rating">{row.accuracy}</span>
                  <span>{row.streak}</span>
                  <span className="earnings">{row.rewards}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SpectatorDashboardPage;
