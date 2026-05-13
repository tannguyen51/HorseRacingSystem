import "./TournamentDetailPage.css";

function TournamentDetailPage() {
  return (
    <div className="tournament-detail-page">
      <section className="detail-hero">
        <div>
          <span className="pill">Championship</span>
          <h1>Spring Championship Finals</h1>
          <p>June 15, 2026 · Churchill Downs</p>
          <div className="detail-actions">
            <button className="primary-button">Register Team</button>
            <button className="ghost-button">Download Rules</button>
          </div>
        </div>
        <div className="detail-panel">
          <h3>Prize Pool</h3>
          <strong>$500,000</strong>
          <p>Broadcast live across 24 countries.</p>
        </div>
      </section>

      <section className="detail-grid">
        <div>
          <h3>Overview</h3>
          <p>
            The Spring Championship Finals gathers the top 12 stables with
            qualifying points. Expect high-speed sprints, elite jockeys, and a
            packed crowd of over 40,000 spectators.
          </p>
        </div>
        <div>
          <h3>Key Details</h3>
          <ul>
            <li>Distance: 1.5 miles</li>
            <li>Entries: 12 / 15</li>
            <li>Surface: Dirt</li>
            <li>Category: Grade 1</li>
          </ul>
        </div>
        <div>
          <h3>Officials</h3>
          <ul>
            <li>Chief Judge: Amara Reed</li>
            <li>Race Director: Louis Knight</li>
            <li>Medical Lead: Dr. Cindy Park</li>
          </ul>
        </div>
      </section>

      <section className="timeline">
        <h2>Race Day Timeline</h2>
        <div className="timeline-grid">
          <div>
            <h4>09:00 AM</h4>
            <p>Stable inspections and safety briefings</p>
          </div>
          <div>
            <h4>12:00 PM</h4>
            <p>Jockey weigh-in and press conference</p>
          </div>
          <div>
            <h4>01:30 PM</h4>
            <p>Parade and warm-up laps</p>
          </div>
          <div>
            <h4>02:00 PM</h4>
            <p>Finals start with live broadcast</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TournamentDetailPage;
