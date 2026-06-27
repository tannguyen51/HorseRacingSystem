import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../../services/spectatorApi";
import "./TournamentListPage.css";

function TournamentListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournaments()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = items.filter((t) => t.isActive ?? t.IsActive).length;

  return (
    <div className="tournament-list-page">
      <div className="tournament-layout">
        <aside className="tournament-sidebar">
          <div className="tournament-sidebar__header">
            <span className="pill">Tournament List</span>
            <h3>Browse events</h3>
            <p className="muted">Explore seasons, rounds, and race capacity.</p>
          </div>
          <div className="tournament-sidebar__card">
            <p className="muted">Live now</p>
            <h4>{activeCount}</h4>
            <span>{items.length} total tournaments</span>
          </div>
        </aside>

        <div className="tournament-content">
          <section className="page-header tournament-hero">
            <h1>Tournaments</h1>
            <p>
              Browse all horse racing tournaments, active seasons, and race
              capacity.
            </p>
          </section>

          {loading ? (
            <div className="empty-state">
              <h3>Loading tournaments</h3>
              <p>Fetching the latest schedule and race information.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No tournaments found</h3>
              <p>There are currently no tournaments to display.</p>
            </div>
          ) : (
            <div className="tournament-list">
              {items.map((t) => (
                <article key={t.id ?? t.Id} className="tournament-card">
                  <div className="tournament-banner">
                    <span
                      className={
                        (t.isActive ?? t.IsActive)
                          ? "status-pill status-pill--active"
                          : "status-pill"
                      }
                    >
                      {(t.isActive ?? t.IsActive) ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="tournament-body">
                    <div>
                      <h3>{t.name ?? t.Name}</h3>
                      <p>
                        {t.description ??
                          t.Description ??
                          "No description available."}
                      </p>
                    </div>
                    <div className="tournament-meta">
                      <div>
                        <span>Rounds</span>
                        <strong>{t.roundCount ?? t.RoundCount ?? 0}</strong>
                      </div>
                      <div>
                        <span>Races</span>
                        <strong>{t.raceCount ?? t.RaceCount ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="tournament-actions">
                    <Link
                      className="ghost-button"
                      to={`/tournaments/${t.id ?? t.Id}`}
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TournamentListPage;
