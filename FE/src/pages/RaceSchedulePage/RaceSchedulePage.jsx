import { useEffect, useState } from "react";
import { getRaces } from "../../services/spectatorApi";
import "./RaceSchedulePage.css";

const fDate = (v) => v ? new Date(v).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "TBD";

function RaceSchedulePage() {
  const [races, setRaces] = useState([]);

  useEffect(() => {
    getRaces().then((d) => setRaces(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="race-schedule-page">
      <section className="page-header"><h1>Race Schedule</h1><p>Upcoming and past races.</p></section>
      {races.length === 0 ? <p>No races scheduled.</p> : (
        <div className="race-grid">
          {races.map((r) => (
            <div key={r.id ?? r.Id} className="race-card">
              <span className="badge">{r.status ?? r.Status}</span>
              <h3>{r.name ?? r.Name}</h3>
              <p>{r.location ?? r.Location ?? "TBD"} | {r.distance ?? r.Distance ?? "-"}m</p>
              <p className="time">{fDate(r.scheduledAt ?? r.ScheduledAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RaceSchedulePage;
