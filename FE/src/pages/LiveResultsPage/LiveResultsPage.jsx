import { useEffect, useState } from "react";
import { getLiveRanking, getRaces } from "../../services/spectatorApi";
import "./LiveResultsPage.css";

function LiveResultsPage() {
  const [races, setRaces] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    getRaces().then((d) => {
      const list = Array.isArray(d) ? d : [];
      setRaces(list);
      const finished = list.filter((r) => (r.status ?? r.Status) === "Finished");
      if (finished.length) setSelectedId((finished[0].id ?? finished[0].Id));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getLiveRanking(selectedId).then((d) => setRanking(d?.data ?? d)).catch(() => {});
  }, [selectedId]);

  const rankings = ranking?.rankings ?? ranking?.Rankings ?? ranking?.positions ?? [];

  return (
    <div className="live-results-page">
      <section className="page-header"><h1>Live Results</h1><p>Real-time race results and rankings.</p></section>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">-- Select race --</option>
        {races.map((r) => <option key={r.id ?? r.Id} value={r.id ?? r.Id}>{r.name ?? r.Name} ({r.status ?? r.Status})</option>)}
      </select>
      {!ranking ? <p>Select a finished race to view results.</p> : (
        <div>
          <h2>{ranking.raceName ?? ranking.race?.name ?? "Race Results"}</h2>
          {rankings.length > 0 ? (
            <table><thead><tr><th>#</th><th>Horse</th><th>Jockey</th><th>Time</th></tr></thead>
              <tbody>{rankings.map((p, i) => <tr key={i}><td>{p.position ?? i + 1}</td><td>{p.horseName}</td><td>{p.jockeyName ?? "-"}</td><td>{p.time ?? "-"}</td></tr>)}</tbody></table>
          ) : (
            <p>Winner: {ranking.winningHorseName ?? ranking.winningHorse?.name ?? "TBD"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveResultsPage;
