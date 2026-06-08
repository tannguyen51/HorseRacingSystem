import { useMemo, useState } from "react";
import "../OwnerSharedLayout.css";
import "./OwnerRaceConfirmationPage.css";

const initialConfirmations = [
  {
    id: 1,
    race: "Coastal Derby",
    date: "June 12 · 4:20 PM",
    horse: "Silver Comet",
    track: "Gulfstream Park",
    gate: "Gate 04",
    jockey: "Pending assignment",
    deadline: "June 8, 2026",
    status: "Pending",
  },
  {
    id: 2,
    race: "Emerald Invitational",
    date: "June 16 · 2:40 PM",
    horse: "Thunder Strike",
    track: "Emerald Downs",
    gate: "Gate 07",
    jockey: "Ariana Blake",
    deadline: "June 10, 2026",
    status: "Pending",
  },
  {
    id: 3,
    race: "Golden Mile",
    date: "June 21 · 5:10 PM",
    horse: "Midnight Runner",
    track: "Santa Anita",
    gate: "Gate 02",
    jockey: "Pending assignment",
    deadline: "June 14, 2026",
    status: "Confirmed",
  },
];

function OwnerRaceConfirmationPage() {
  const [confirmations, setConfirmations] = useState(initialConfirmations);

  const statusCounts = useMemo(
    () =>
      confirmations.reduce(
        (counts, race) => ({
          ...counts,
          [race.status]: (counts[race.status] ?? 0) + 1,
        }),
        {},
      ),
    [confirmations],
  );

  const updateStatus = (id, status) => {
    setConfirmations((current) =>
      current.map((race) => (race.id === id ? { ...race, status } : race)),
    );
  };

  return (
    <div className="owner-page owner-race-confirmation">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Race confirmations</h3>
            <p className="muted">Approve or reject upcoming entries.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Pending confirmations</p>
            <h4>{statusCounts.Pending ?? 0} races</h4>
            <span>Awaiting owner action</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Confirmed</p>
            <h4>{statusCounts.Confirmed ?? 0} races</h4>
            <span>Ready to participate</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Race confirmations</h1>
            <p>Confirm participation and keep your roster aligned.</p>
          </section>

          <section className="confirmation-summary">
            <article>
              <span>Pending</span>
              <strong>{statusCounts.Pending ?? 0}</strong>
              <p>Need a decision</p>
            </article>
            <article>
              <span>Confirmed</span>
              <strong>{statusCounts.Confirmed ?? 0}</strong>
              <p>Participation locked</p>
            </article>
            <article>
              <span>Declined</span>
              <strong>{statusCounts.Declined ?? 0}</strong>
              <p>Removed from lineup</p>
            </article>
          </section>

          <section className="confirmation-grid">
            {confirmations.map((race) => (
              <article key={race.id} className="confirmation-card">
                <div className="confirmation-header">
                  <div>
                    <h3>{race.race}</h3>
                    <p className="muted">{race.track}</p>
                  </div>
                  <span
                    className={`confirmation-status confirmation-status--${race.status.toLowerCase()}`}
                  >
                    {race.status}
                  </span>
                </div>
                <div className="confirmation-meta">
                  <div>
                    <span>Race date</span>
                    <strong>{race.date}</strong>
                  </div>
                  <div>
                    <span>Horse</span>
                    <strong>{race.horse}</strong>
                  </div>
                  <div>
                    <span>Gate</span>
                    <strong>{race.gate}</strong>
                  </div>
                  <div>
                    <span>Jockey</span>
                    <strong>{race.jockey}</strong>
                  </div>
                  <div>
                    <span>Confirm by</span>
                    <strong>{race.deadline}</strong>
                  </div>
                </div>
                <div className="confirmation-actions">
                  <button
                    className="confirmation-action confirmation-action--confirm"
                    onClick={() => updateStatus(race.id, "Confirmed")}
                    disabled={race.status === "Confirmed"}
                  >
                    Confirm participation
                  </button>
                  <button
                    className="confirmation-action confirmation-action--decline"
                    onClick={() => updateStatus(race.id, "Declined")}
                    disabled={race.status === "Declined"}
                  >
                    Decline
                  </button>
                  <button className="confirmation-action confirmation-action--details">
                    View details
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerRaceConfirmationPage;
