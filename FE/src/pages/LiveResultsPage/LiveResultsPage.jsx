import "./LiveResultsPage.css";

function LiveResultsPage() {
  return (
    <div className="live-results-page">
      <section className="page-header">
        <h1>Live Results</h1>
        <p>Real-time leaderboard from live races around the world.</p>
      </section>

      <div className="results-grid">
        {[
          {
            race: "Gulf Coast Sprint",
            track: "Gulfstream Park",
            status: "Live",
            leader: "Thunder Strike",
            time: "1:29.4",
          },
          {
            race: "Emerald Derby",
            track: "Emerald Downs",
            status: "Final",
            leader: "Silver Bullet",
            time: "1:45.2",
          },
          {
            race: "Capital Stakes",
            track: "Laurel Park",
            status: "Live",
            leader: "Golden Dawn",
            time: "1:33.8",
          },
        ].map((result) => (
          <article key={result.race} className="result-card">
            <div>
              <span className="badge">{result.status}</span>
              <h3>{result.race}</h3>
              <p>{result.track}</p>
            </div>
            <div className="result-meta">
              <p>Leader</p>
              <strong>{result.leader}</strong>
              <span>{result.time}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default LiveResultsPage;
