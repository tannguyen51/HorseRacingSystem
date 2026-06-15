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

  return (
    <div className="tournament-list-page">
      <section className="page-header tournament-hero">
        <span className="pill">Tournament List</span>
        <h1>Tournaments</h1>
        <p>Browse all horse racing tournaments, active seasons, and race capacity.</p>
      </section>

      {loading ? (
        <p className="empty-state">Loading tournaments...</p>
      ) : items.length === 0 ? (
        <p className="empty-state">No tournaments found.</p>
      ) : (
        <div className="tournament-list">
          {items.map((t) => (
            <Link
              key={t.id ?? t.Id}
              to={`/tournaments/${t.id ?? t.Id}`}
              className="tournament-card"
            >
              <div>
                <span
                  className={
                    (t.isActive ?? t.IsActive)
                      ? "status-pill status-pill--active"
                      : "status-pill"
                  }
                >
                  {(t.isActive ?? t.IsActive) ? "Active" : "Inactive"}
                </span>
                <h3>{t.name ?? t.Name}</h3>
                <p>{t.description ?? t.Description ?? "No description available."}</p>
              </div>
              <div className="tournament-meta">
                <span>{t.roundCount ?? t.RoundCount ?? 0} rounds</span>
                <span>{t.raceCount ?? t.RaceCount ?? 0} races</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentListPage;
