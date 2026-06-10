import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveTournaments } from "../../services/spectatorApi";
import heroImage from "../../assets/racing.png";
import "./HomePage.css";

function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveTournaments()
      .then((d) => setTournaments(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <span className="pill">2026 Championship Season</span>
          <h1>Elite Horse Racing Tournament Platform</h1>
          <p>Welcome to the world's premier horse racing management system with advanced analytics, live results, and season-wide standings.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/tournaments">View Tournaments</Link>
            <Link className="ghost-button" to="/live-results">Live Results</Link>
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-image"><img src={heroImage} alt="Champion horses racing" /></div>
          <div className="hero-panel">
            <h3>{loading ? "Loading..." : (tournaments[0]?.name ?? tournaments[0]?.Name ?? "Upcoming Races")}</h3>
            <p>{loading ? "" : `${tournaments.length} active tournament(s)`}</p>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Active Tournaments</h2>
        {loading ? <p>Loading...</p> : tournaments.length === 0 ? <p>No active tournaments.</p> : (
          <div className="feature-grid">
            {tournaments.map((t) => (
              <Link key={t.id ?? t.Id} to={`/tournaments/${t.id ?? t.Id}`} className="feature-card">
                <h3>{t.name ?? t.Name}</h3>
                <p>{t.description ?? t.Description ?? "No description"}</p>
                <span>{t.raceCount ?? t.RaceCount ?? 0} races</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="cta">
        <h2>Ready to Participate?</h2>
        <p>Register as a Horse Owner, Jockey, or Spectator to join the action.</p>
        <Link className="primary-button" to="/register">Get Started</Link>
      </section>
    </div>
  );
}

export default HomePage;
