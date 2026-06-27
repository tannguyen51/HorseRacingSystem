import { useEffect, useState } from "react";
import { getRaces } from "../../services/spectatorApi";
import "./RaceSchedulePage.css";

const fDate = (v) =>
  v
    ? new Date(v).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "TBD";

function RaceSchedulePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRaces()
      .then((d) => setRaces(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="race-schedule-page">
      <section className="page-header schedule-hero">
        <span className="pill">Race Schedule</span>
        <h1>Race Schedule</h1>
        <p>Upcoming and past races with status, venue, distance, and start time.</p>
      </section>

      {loading ? (
        <p className="empty-state">Loading races...</p>
      ) : races.length === 0 ? (
        <p className="empty-state">No races scheduled.</p>
      ) : (
        <div className="race-grid">
          {races.map((r) => (
            <div key={r.id ?? r.Id} className="race-card">
              <div>
                <span className="badge">{r.status ?? r.Status ?? "Scheduled"}</span>
                <h3>{r.name ?? r.Name}</h3>
              </div>
              <div className="race-meta">
                <span>{r.location ?? r.Location ?? "TBD"}</span>
                <span>{r.distance ?? r.Distance ?? "-"}m</span>
                <strong>{fDate(r.scheduledAt ?? r.ScheduledAt)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RaceSchedulePage;
