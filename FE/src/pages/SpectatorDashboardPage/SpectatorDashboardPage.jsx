import { useEffect, useState } from "react";
import { getActiveTournaments, getRaces } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorDashboardPage.css";

function SpectatorDashboardPage() {
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActiveTournaments().catch(() => []),
      getRaces().catch(() => []),
    ]).then(([t, r]) => {
      setTournaments(Array.isArray(t) ? t.slice(0, 4) : []);
      setRaces(Array.isArray(r) ? r.slice(0, 4) : []);
    }).finally(() => setLoading(false));
  }, []);

  const liveRaces = races.filter((r) => (r.status ?? r.Status) === "InProgress");

  return (
    <div className="spectator-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Dashboard</h3>
          </div>
          <div className="spectator-sidebar__card"><p>Active Tournaments</p><h4>{loading ? "-" : tournaments.length}</h4></div>
          <div className="spectator-sidebar__card"><p>Live Races</p><h4>{liveRaces.length}</h4></div>
        </aside>

        <div className="spectator-content">
          <section className="page-header"><h1>Race Dashboard</h1><p>Live tournaments and upcoming races.</p></section>

          {loading ? <p>Loading...</p> : (
            <>
              {liveRaces.length > 0 && (
                <section>
                  <h2>Live Now</h2>
                  <div className="card-grid">
                    {liveRaces.map((r) => (
                      <div key={r.id ?? r.Id} className="card">
                        <span className="badge">LIVE</span>
                        <h3>{r.name ?? r.Name}</h3>
                        <p>{r.location ?? r.Location}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2>Active Tournaments</h2>
                {tournaments.length === 0 ? <p className="muted">No active tournaments.</p> : (
                  <div className="card-grid">
                    {tournaments.map((t) => (
                      <div key={t.id ?? t.Id} className="card">
                        <h3>{t.name ?? t.Name}</h3>
                        <p>{t.category ?? t.Category ?? "-"} | {t.venue ?? t.Venue ?? "-"}</p>
                        <span>Prize: ${t.prizePool ?? t.PrizePool ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2>Upcoming Races</h2>
                {races.length === 0 ? <p className="muted">No races scheduled.</p> : races.map((r) => (
                  <div key={r.id ?? r.Id} className="card" style={{ marginBottom: 8 }}>
                    <h3>{r.name ?? r.Name}</h3>
                    <p>{r.status ?? r.Status} | {r.distance ?? r.Distance}m</p>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpectatorDashboardPage;
