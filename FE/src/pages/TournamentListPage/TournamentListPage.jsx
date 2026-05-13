import { Link } from "react-router-dom";
import "./TournamentListPage.css";

function TournamentListPage() {
  return (
    <div className="tournament-list-page">
      <section className="page-header">
        <h1>Tournament Schedule</h1>
        <p>Browse and register for upcoming races.</p>
      </section>

      <div className="filters">
        <input type="text" placeholder="Search tournaments or locations..." />
        <select>
          <option>All</option>
          <option>Open</option>
          <option>Filling Fast</option>
          <option>Full</option>
        </select>
      </div>

      <div className="card-grid">
        {[
          {
            title: "Spring Championship Finals",
            date: "June 15, 2026 · 2:00 PM",
            location: "Churchill Downs",
            prize: "$500,000",
            status: "Open",
          },
          {
            title: "Derby Classic",
            date: "June 22, 2026 · 3:30 PM",
            location: "Belmont Park",
            prize: "$350,000",
            status: "Open",
          },
          {
            title: "Grand Prix Invitational",
            date: "June 29, 2026 · 1:00 PM",
            location: "Santa Anita Park",
            prize: "$750,000",
            status: "Filling Fast",
          },
          {
            title: "Elite Stakes",
            date: "July 6, 2026 · 4:00 PM",
            location: "Saratoga Springs",
            prize: "$400,000",
            status: "Open",
          },
        ].map((tournament, index) => (
          <article key={tournament.title} className="tournament-card">
            <div>
              <div className="card-header">
                <span className="badge">{tournament.status}</span>
                <span className="prize">{tournament.prize}</span>
              </div>
              <h3>{tournament.title}</h3>
              <p>{tournament.date}</p>
              <p>{tournament.location}</p>
            </div>
            <div className="card-actions">
              <button className="primary-button">Register</button>
              <Link className="ghost-button" to={`/tournaments/${index + 1}`}>
                Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default TournamentListPage;
