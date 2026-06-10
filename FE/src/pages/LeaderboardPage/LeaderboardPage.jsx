import { useEffect, useState } from "react";
import { getActiveTournaments } from "../../services/spectatorApi";
import "./LeaderboardPage.css";

function LeaderboardPage() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    getActiveTournaments()
      .then((d) => setTournaments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <div className="leaderboard-page">
      <section className="page-header"><h1>Leaderboard</h1><p>Tournament standings and top performers.</p></section>
      {tournaments.length === 0 ? <p>No active tournaments with standings yet.</p> : (
        <div className="leaderboard-grid">
          {tournaments.map((t) => (
            <div key={t.id ?? t.Id} className="leaderboard-card">
              <h3>{t.name ?? t.Name}</h3>
              <p>Category: {t.category ?? t.Category ?? "-"}</p>
              <p>Prize Pool: ${t.prizePool ?? t.PrizePool ?? 0}</p>
              <p>Races: {t.raceCount ?? t.RaceCount ?? 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeaderboardPage;
