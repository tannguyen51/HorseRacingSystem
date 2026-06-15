import { useEffect, useMemo, useState } from "react";
import { getMyPredictions } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorPredictionResultPage.css";

const fDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "TBD";

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

  const stats = useMemo(() => {
    const won = predictions.filter((p) => (p.status ?? p.Status) === "Won");
    const pending = predictions.filter((p) => (p.status ?? p.Status) === "Pending");
    const payout = predictions.reduce(
      (sum, p) => sum + Number(p.payoutAmount ?? p.PayoutAmount ?? 0),
      0,
    );
    return { won, pending, payout };
  }, [predictions]);

  return (
    <div className="spectator-page prediction-results-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>My Predictions</h3>
          </div>
          <div className="spectator-sidebar__card">
            <p>Won</p>
            <h4>{stats.won.length}</h4>
          </div>
          <div className="spectator-sidebar__card">
            <p>Pending</p>
            <h4>{stats.pending.length}</h4>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="prediction-results-hero">
            <div>
              <span className="pill">Prediction Results</span>
              <h1>Prediction Results</h1>
              <p>Track your race predictions, wager status, payout history, and result dates.</p>
            </div>
            <div className="prediction-summary">
              <article>
                <span>Total</span>
                <strong>{predictions.length}</strong>
              </article>
              <article>
                <span>Won</span>
                <strong>{stats.won.length}</strong>
              </article>
              <article>
                <span>Payout</span>
                <strong>${stats.payout}</strong>
              </article>
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}

          {loading ? (
            <p className="empty-state">Loading prediction results...</p>
          ) : predictions.length === 0 ? (
            <p className="empty-state">No predictions yet. Place your first prediction to see results here.</p>
          ) : (
            <div className="prediction-result-grid">
              {predictions.map((p) => {
                const status = p.status ?? p.Status ?? "Pending";
                return (
                  <article key={p.id ?? p.Id} className="prediction-result-card">
                    <div>
                      <span className={`prediction-status prediction-status--${String(status).toLowerCase()}`}>
                        {status}
                      </span>
                      <h3>{p.raceName ?? p.RaceName ?? "Race"}</h3>
                      <p>Horse: {p.predictedHorseName ?? p.PredictedHorseName ?? "-"}</p>
                    </div>
                    <div className="prediction-result-meta">
                      <span>Bet <strong>${p.betAmount ?? p.BetAmount ?? 0}</strong></span>
                      <span>Payout <strong>${p.payoutAmount ?? p.PayoutAmount ?? "-"}</strong></span>
                      <span>Date <strong>{fDate(p.createdAt ?? p.CreatedAt)}</strong></span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpectatorPredictionResultPage;
