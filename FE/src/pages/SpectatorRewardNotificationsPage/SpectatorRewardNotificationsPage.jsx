import { useEffect, useState } from "react";
import { getMyPredictions } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorRewardNotificationsPage.css";

const fDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "TBD";

function SpectatorRewardNotificationsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPredictions()
      .then((d) => setPredictions(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const won = predictions.filter((p) => (p.status ?? p.Status) === "Won");
  const totalPayout = won.reduce((sum, p) => sum + (p.payoutAmount ?? p.PayoutAmount ?? 0), 0);

  return (
    <div className="spectator-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header"><p className="pill">Spectator</p><h3>Rewards</h3></div>
          <div className="spectator-sidebar__card"><p>Total Winnings</p><h4>${totalPayout}</h4></div>
          <div className="spectator-sidebar__card"><p>Predictions Won</p><h4>{won.length}</h4></div>
        </aside>
        <div className="spectator-content">
          <section className="page-header"><h1>Reward Notifications</h1><p>Your prediction winnings and rewards.</p></section>
          {loading ? <p>Loading...</p> : won.length === 0 ? <p className="muted">No winnings yet. Keep predicting!</p> : (
            <div>
              {won.map((p) => (
                <div key={p.id ?? p.Id} className="card" style={{ marginBottom: 8 }}>
                  <span className="badge badge--won">WON</span>
                  <h3>{p.raceName ?? p.RaceName ?? "Race"}</h3>
                  <p>Payout: <strong>${p.payoutAmount ?? p.PayoutAmount ?? 0}</strong></p>
                  <p className="time">{fDate(p.settledAt ?? p.SettledAt ?? p.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SpectatorRewardNotificationsPage;
