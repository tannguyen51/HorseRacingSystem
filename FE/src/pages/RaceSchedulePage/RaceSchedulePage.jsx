import "./RaceSchedulePage.css";

function RaceSchedulePage() {
  return (
    <div className="race-schedule-page">
      <section className="page-header">
        <h1>Race Schedule</h1>
        <p>Live scheduling for qualifiers, heats, and championship races.</p>
      </section>

      <div className="schedule-grid">
        {[
          {
            date: "July 12, 2026",
            track: "Del Mar",
            title: "Summer Sprint Championship",
            time: "2:30 PM",
            status: "Full",
          },
          {
            date: "July 20, 2026",
            track: "Pimlico",
            title: "Heritage Cup",
            time: "3:00 PM",
            status: "Open",
          },
          {
            date: "July 27, 2026",
            track: "Aqueduct",
            title: "Metropolitan Mile",
            time: "1:30 PM",
            status: "Open",
          },
          {
            date: "August 3, 2026",
            track: "Santa Anita Park",
            title: "Pacific Classic",
            time: "4:30 PM",
            status: "Open",
          },
        ].map((race) => (
          <article key={race.title} className="schedule-card">
            <div>
              <span className="badge">{race.status}</span>
              <h3>{race.title}</h3>
              <p>{race.date}</p>
              <p>{race.track}</p>
            </div>
            <div className="schedule-meta">
              <span>{race.time}</span>
              <button className="ghost-button">View Details</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default RaceSchedulePage;
