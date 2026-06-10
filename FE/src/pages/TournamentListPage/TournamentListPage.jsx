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
    <div className="page">
      <section className="page-header"><h1>Tournaments</h1><p>Browse all horse racing tournaments.</p></section>
      {loading ? <p>Loading...</p> : items.length === 0 ? <p>No tournaments found.</p> : (
        <div className="tournament-list">
          {items.map((t) => (
            <Link key={t.id ?? t.Id} to={`/tournaments/${t.id ?? t.Id}`} className="tournament-card">
              <h3>{t.name ?? t.Name}</h3>
              <p>{t.description ?? t.Description ?? ""}</p>
              <span>Races: {t.raceCount ?? t.RaceCount ?? 0}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default TournamentListPage;
