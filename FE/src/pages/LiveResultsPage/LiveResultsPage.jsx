import { useEffect, useState } from "react";
import { getLiveRanking, getRaces } from "../../services/spectatorApi";
import "./LiveResultsPage.css";

function LiveResultsPage() {
  const [races, setRaces] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    getRaces()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setRaces(list);
        const finished = list.filter((r) => (r.status ?? r.Status) === "Finished");
        if (finished.length) setSelectedId(finished[0].id ?? finished[0].Id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setRanking(null);
      return;
    }
    getLiveRanking(selectedId)
      .then((d) => setRanking(d?.data ?? d))
      .catch(() => setRanking(null));
  }, [selectedId]);

  const rankings = ranking?.rankings ?? ranking?.Rankings ?? ranking?.positions ?? [];

  return (
    <div className="live-results-page">
      <section className="page-header results-hero">
        <span className="pill">Live Results</span>
        <h1>Live Results</h1>
        <p>Review finished race rankings, winners, jockeys, and recorded times.</p>
      </section>

      <div className="results-toolbar">
        <label htmlFor="race-result-select">Race</label>
        <select
          id="race-result-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select race</option>
          {races.map((r) => (
            <option key={r.id ?? r.Id} value={r.id ?? r.Id}>
              {r.name ?? r.Name} ({r.status ?? r.Status})
            </option>
          ))}
        </select>
      </div>

      {!ranking ? (
        <p className="empty-state">Select a finished race to view results.</p>
      ) : (
        <div className="result-panel">
          <h2>{ranking.raceName ?? ranking.race?.name ?? "Race Results"}</h2>
          {rankings.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Horse</th>
                  <th>Jockey</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((p, i) => (
                  <tr key={`${p.horseName ?? "horse"}-${i}`}>
                    <td>{p.position ?? i + 1}</td>
                    <td>{p.horseName ?? "-"}</td>
                    <td>{p.jockeyName ?? "-"}</td>
                    <td>{p.time ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="winner-card">
              Winner: <strong>{ranking.winningHorseName ?? ranking.winningHorse?.name ?? "TBD"}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveResultsPage;
