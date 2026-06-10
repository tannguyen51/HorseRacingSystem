import { useEffect, useState } from "react";
import { getMyPredictions } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorPredictionResultPage.css";

const fDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "TBD";

function SpectatorPredictionResultPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyPredictions()
      .then((d) => setPredictions(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const won = predictions.filter((p) => (p.status ?? p.Status) === "Won");
  const pending = predictions.filter((p) => (p.status ?? p.Status) === "Pending");

  return (
    <div className="spectator-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header"><p className="pill">Spectator</p><h3>My Predictions</h3></div>
          <div className="spectator-sidebar__card"><p>Won</p><h4>{won.length}</h4></div>
          <div className="spectator-sidebar__card"><p>Pending</p><h4>{pending.length}</h4></div>
        </aside>
        <div className="spectator-content">
          <section className="page-header"><h1>Prediction Results</h1></section>
          {error && <p className="form-error">{error}</p>}
          {loading ? <p>Loading...</p> : predictions.length === 0 ? <p className="muted">No predictions yet. Place your first bet!</p> : (
            <div>
              {predictions.map((p) => (
                <div key={p.id ?? p.Id} className="card" style={{ marginBottom: 8 }}>
                  <span className={`badge badge--${String(p.status ?? p.Status ?? "").toLowerCase()}`}>{p.status ?? p.Status}</span>
                  <h3>{p.raceName ?? p.RaceName ?? "Race"}</h3>
                  <p>Horse: {p.predictedHorseName ?? p.PredictedHorseName ?? "-"}</p>
                  <p>Bet: ${p.betAmount ?? p.BetAmount ?? 0} | Payout: ${p.payoutAmount ?? p.PayoutAmount ?? "-"}</p>
                  <p className="time">{fDate(p.createdAt ?? p.CreatedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpectatorPredictionResultPage;
