import { useEffect, useState } from "react";
import { getActiveTournaments, getRaces } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorDashboardPage.css";

const formatRaceTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBD";

function SpectatorDashboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActiveTournaments().catch(() => []),
      getRaces().catch(() => []),
    ])
      .then(([t, r]) => {
        setTournaments(Array.isArray(t) ? t.slice(0, 4) : []);
        setRaces(Array.isArray(r) ? r.slice(0, 4) : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const liveRaces = races.filter((r) => (r.status ?? r.Status) === "InProgress");

  return (
    <div className="spectator-page spectator-dashboard">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Dashboard</h3>
          </div>
          <div className="spectator-sidebar__card">
            <p>Active Tournaments</p>
            <h4>{loading ? "-" : tournaments.length}</h4>
          </div>
          <div className="spectator-sidebar__card">
            <p>Live Races</p>
            <h4>{liveRaces.length}</h4>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="spectator-dashboard-hero">
            <div>
              <span className="pill">Spectator Hub</span>
              <h1>Race Dashboard</h1>
              <p>Live tournaments, race schedules, and quick spectator context in one place.</p>
            </div>
            <div className="dashboard-summary">
              <article>
                <span>Tournaments</span>
                <strong>{loading ? "-" : tournaments.length}</strong>
              </article>
              <article>
                <span>Races</span>
                <strong>{loading ? "-" : races.length}</strong>
              </article>
              <article>
                <span>Live Now</span>
                <strong>{liveRaces.length}</strong>
              </article>
            </div>
          </section>

          {loading ? (
            <p className="empty-state">Loading spectator dashboard...</p>
          ) : (
            <>
              <section className="spectator-section">
                <div className="section-heading">
                  <h2>Live Now</h2>
                  <p>Races currently in progress.</p>
                </div>
                {liveRaces.length === 0 ? (
                  <p className="empty-state">No races are live right now.</p>
                ) : (
                  <div className="dashboard-grid">
                    {liveRaces.map((r) => (
                      <article key={r.id ?? r.Id} className="dashboard-card dashboard-card--live">
                        <span className="status-pill status-pill--live">Live</span>
                        <h3>{r.name ?? r.Name}</h3>
                        <p>{r.location ?? r.Location ?? "Location TBD"}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="spectator-section">
                <div className="section-heading">
                  <h2>Active Tournaments</h2>
                  <p>Open tournament activity available to spectators.</p>
                </div>
                {tournaments.length === 0 ? (
                  <p className="empty-state">No active tournaments.</p>
                ) : (
                  <div className="dashboard-grid">
                    {tournaments.map((t) => (
                      <article key={t.id ?? t.Id} className="dashboard-card">
                        <span className="status-pill">Active</span>
                        <h3>{t.name ?? t.Name}</h3>
                        <p>{t.description ?? t.Description ?? "No description available."}</p>
                        <div className="dashboard-meta">
                          <span>{t.roundCount ?? t.RoundCount ?? 0} rounds</span>
                          <span>{t.raceCount ?? t.RaceCount ?? 0} races</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="spectator-section">
                <div className="section-heading">
                  <h2>Upcoming Races</h2>
                  <p>Schedule snapshots from the race endpoint.</p>
                </div>
                {races.length === 0 ? (
                  <p className="empty-state">No races scheduled.</p>
                ) : (
                  <div className="race-stack">
                    {races.map((r) => (
                      <article key={r.id ?? r.Id} className="race-row">
                        <div>
                          <span className="status-pill">{r.status ?? r.Status ?? "Scheduled"}</span>
                          <h3>{r.name ?? r.Name}</h3>
                          <p>{r.location ?? r.Location ?? "Location TBD"}</p>
                        </div>
                        <div className="race-row__meta">
                          <span>{r.distance ?? r.Distance ?? "-"}m</span>
                          <strong>{formatRaceTime(r.scheduledAt ?? r.ScheduledAt)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpectatorDashboardPage;
