import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getActiveTournaments, getRaces } from "../../services/spectatorApi";
import heroImage from "../../assets/racing.png";
import homeOneImage from "../../assets/home1.png";
import homeTwoImage from "../../assets/home2.png";
import jockeyImage from "../../assets/Jockey.png";
import "./HomePage.css";

function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRaceTime = (value) =>
    value
      ? new Date(value).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "TBD";

  useEffect(() => {
    Promise.all([getActiveTournaments(), getRaces()])
      .then(([tournamentData, raceData]) => {
        const tournamentList = Array.isArray(tournamentData)
          ? tournamentData.slice(0, 3)
          : [];
        const raceList = Array.isArray(raceData)
          ? raceData
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.scheduledAt ?? a.ScheduledAt ?? 0) -
                  new Date(b.scheduledAt ?? b.ScheduledAt ?? 0),
              )
              .slice(0, 3)
          : [];

        setTournaments(tournamentList);
        setRaces(raceList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page container-xxl">
      <section className="hero">
        <div className="hero-copy">
          <span className="pill badge rounded-pill">2026 Championship Season</span>
          <h1>Race day management, dressed for the grandstand.</h1>
          <p>Run tournaments, schedules, live results, and season standings through a cleaner racing experience inspired by premium sport and fashion editorials.</p>
          <div className="hero-actions d-flex flex-wrap">
            <Link className="primary-button btn" to="/tournaments">View Tournaments</Link>
            <Link className="ghost-button btn" to="/live-results">Live Results</Link>
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-image"><img src={heroImage} alt="Grandstand and horse racing track" /></div>
          <div className="hero-panel">
            <span>Now featuring</span>
            <h3>{loading ? "Loading..." : (tournaments[0]?.name ?? tournaments[0]?.Name ?? "Upcoming Races")}</h3>
            <p>{loading ? "" : `${tournaments.length} active tournament(s) and ${races.length} scheduled race(s) ready for the season.`}</p>
          </div>
        </div>
      </section>

      <section className="brand-story" aria-label="RaceMaster experience">
        <div className="brand-story__image brand-story__image--tall">
          <img src={homeOneImage} alt="Aerial view of a packed racing venue" />
        </div>
        <div className="brand-story__copy">
          <span className="pill badge rounded-pill">Trackside Standard</span>
          <h2>Bright surfaces, sharp data, and a venue-first visual rhythm.</h2>
          <p>
            The interface keeps the energy of the track visible while giving managers,
            owners, jockeys, and spectators a lighter place to work.
          </p>
        </div>
        <div className="brand-story__image">
          <img src={jockeyImage} alt="Jockeys racing toward the finish" />
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span className="pill badge rounded-pill">Live Season</span>
          <h2>Active Tournaments</h2>
          <p>Track open competitions, racing schedules, and current event momentum.</p>
        </div>
        {loading ? <p className="muted">Loading...</p> : tournaments.length === 0 ? <p className="muted">No active tournaments.</p> : (
          <div className="feature-grid row g-4">
            {tournaments.map((t) => (
              <div className="col-12 col-md-6 col-xl-4" key={t.id ?? t.Id}>
                <Link to={`/tournaments/${t.id ?? t.Id}`} className="feature-card card h-100">
                  <div className="card-body">
                    <span className="badge text-bg-warning">{t.raceCount ?? t.RaceCount ?? 0} races</span>
                    <h3>{t.name ?? t.Name}</h3>
                    <p>{t.description ?? t.Description ?? "No description"}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="home-schedule">
        <div className="section-heading">
          <span className="pill badge rounded-pill">Race Schedule</span>
          <h2>Upcoming Races</h2>
          <p>Connected directly to the race schedule endpoint.</p>
        </div>
        {loading ? (
          <p className="muted">Loading...</p>
        ) : races.length === 0 ? (
          <p className="muted">No races scheduled.</p>
        ) : (
          <div className="home-race-grid">
            {races.map((race) => (
              <Link
                key={race.id ?? race.Id}
                to="/schedule"
                className="home-race-card"
              >
                <span className="badge">{race.status ?? race.Status ?? "Scheduled"}</span>
                <h3>{race.name ?? race.Name}</h3>
                <p>{race.location ?? race.Location ?? "TBD"} | {race.distance ?? race.Distance ?? "-"}m</p>
                <strong>{formatRaceTime(race.scheduledAt ?? race.ScheduledAt)}</strong>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="cta text-center">
        <img src={homeTwoImage} alt="" aria-hidden="true" />
        <div>
          <h2>Ready to Participate?</h2>
          <p>Register as a Horse Owner, Jockey, or Spectator to join the action.</p>
          <Link className="primary-button btn" to="/register">Get Started</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
