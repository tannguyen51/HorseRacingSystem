import { useEffect, useMemo, useState } from "react";
import { formatJockeyDate, getJockeyAssignedRaces } from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyPerformancePage.css";

const fallbackRaces = [
  {
    id: "sample-performance-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    horseName: "Silver Comet",
    horseTotalRaces: 12,
    horseTotalWins: 4,
    status: "Assigned",
  },
  {
    id: "sample-performance-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    horseName: "Midnight Runner",
    horseTotalRaces: 18,
    horseTotalWins: 6,
    status: "Scheduled",
  },
];

export function JockeyPerformancePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPerformance = async () => {
      try {
        setLoading(true);
        const data = await getJockeyAssignedRaces();
        if (!cancelled) {
          setRaces(data);
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setMessage(error.message || "Unable to load performance data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPerformance();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const assignedRaces = races.length;
    const confirmed = races.filter((race) => race.jockeyConfirmed).length;
    const horseStarts = races.reduce(
      (sum, race) => sum + Number(race.horseTotalRaces || 0),
      0,
    );
    const horseWins = races.reduce(
      (sum, race) => sum + Number(race.horseTotalWins || 0),
      0,
    );
    const winRate =
      horseStarts > 0 ? `${Math.round((horseWins / horseStarts) * 100)}%` : "0%";

    return { assignedRaces, confirmed, horseStarts, horseWins, winRate };
  }, [races]);

  return (
    <div className="spectator-page jockey-performance">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Performance</p>
            <h3>Rider summary</h3>
            <p className="muted">Performance view from current assignments.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Assigned mounts</p>
            <h4>{loading ? "Loading..." : summary.assignedRaces}</h4>
            <span>{summary.confirmed} confirmed</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-performance-header">
            <div>
              <span className="pill">Performance Summary</span>
              <h1>Jockey Performance</h1>
              <p>
                Monitor assignment volume, mount win history, and race readiness
                from the current schedule.
              </p>
              {message ? <p className="jockey-performance-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-performance-stats">
            <article className="jockey-performance-stat">
              <span>Assigned races</span>
              <strong>{summary.assignedRaces}</strong>
              <p className="muted">Current ride queue</p>
            </article>
            <article className="jockey-performance-stat">
              <span>Confirmed rides</span>
              <strong>{summary.confirmed}</strong>
              <p className="muted">Jockey-confirmed entries</p>
            </article>
            <article className="jockey-performance-stat">
              <span>Mount win rate</span>
              <strong>{summary.winRate}</strong>
              <p className="muted">{summary.horseWins} wins / {summary.horseStarts} starts</p>
            </article>
          </section>

          <section className="jockey-performance-panel">
            <div className="section-heading">
              <h2>Assigned Mount Performance</h2>
              <p>Horse record summary for every race currently assigned to you.</p>
            </div>
            <div className="jockey-performance-table">
              <div className="jockey-performance-row jockey-performance-row--head">
                <span>Race</span>
                <span>Horse</span>
                <span>Schedule</span>
                <span>Horse Record</span>
                <span>Status</span>
              </div>
              {races.map((race) => (
                <div key={race.id} className="jockey-performance-row">
                  <span>
                    <strong>{race.title}</strong>
                    <small>{race.location}</small>
                  </span>
                  <span>{race.horseName}</span>
                  <span>{formatJockeyDate(race.scheduledAt)}</span>
                  <span>
                    {race.horseTotalWins || 0} wins / {race.horseTotalRaces || 0} races
                  </span>
                  <span className="badge">{race.status}</span>
                </div>
              ))}
              {!loading && races.length === 0 ? (
                <p className="muted">No performance data available yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeyPerformancePage;
