import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTournament, getRoundsByTournament } from "../../services/spectatorApi";
import "./TournamentDetailPage.css";

function TournamentDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    getTournament(id).then((d) => setTournament(d?.data ?? d)).catch(() => {});
    getRoundsByTournament(id).then((d) => setRounds(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : [])).catch(() => {});
  }, [id]);

  if (!tournament) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="tournament-detail-page">
      <section className="page-header">
        <h1>{tournament.name ?? tournament.Name}</h1>
        <p>{tournament.description ?? tournament.Description}</p>
      </section>
      <div className="detail-grid">
        <div><span>Category</span><strong>{tournament.category ?? tournament.Category ?? "-"}</strong></div>
        <div><span>Venue</span><strong>{tournament.venue ?? tournament.Venue ?? "-"}</strong></div>
        <div><span>Country</span><strong>{tournament.country ?? tournament.Country ?? "-"}</strong></div>
        <div><span>Rounds</span><strong>{rounds.length}</strong></div>
        <div><span>Prize Pool</span><strong>${tournament.prizePool ?? tournament.PrizePool ?? 0}</strong></div>
      </div>
      <h2>Rounds</h2>
      {rounds.length === 0 ? <p>No rounds yet.</p> : rounds.map((r) => (
        <div key={r.id ?? r.Id} className="round-card" style={{ padding: 16, marginBottom: 12, border: "1px solid rgba(231,198,120,.1)", borderRadius: 12 }}>
          <h3>{r.name ?? r.Name} (#{r.roundNumber ?? r.RoundNumber})</h3>
          <p>{r.description ?? r.Description ?? ""}</p>
        </div>
      ))}
    </div>
  );
}

export default TournamentDetailPage;
