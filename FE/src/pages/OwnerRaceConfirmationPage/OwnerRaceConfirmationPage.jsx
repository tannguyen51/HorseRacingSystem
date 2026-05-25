import "../OwnerSharedLayout.css";
import "./OwnerRaceConfirmationPage.css";

const confirmations = [
  {
    id: 1,
    race: "Coastal Derby",
    date: "May 22 · 4:20 PM",
    horse: "Silver Comet",
    track: "Gulfstream Park",
    countdown: "3d 4h",
  },
  {
    id: 2,
    race: "Emerald Invitational",
    date: "May 24 · 2:40 PM",
    horse: "Thunder Strike",
    track: "Emerald Downs",
    countdown: "5d 2h",
  },
  {
    id: 3,
    race: "Golden Mile",
    date: "May 28 · 5:10 PM",
    horse: "Midnight Runner",
    track: "Santa Anita",
    countdown: "9d 6h",
  },
];

function OwnerRaceConfirmationPage() {
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
            <h4>3 races</h4>
            <span>Due within 7 days</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Race confirmations</h1>
            <p>Confirm participation and keep your roster aligned.</p>
          </section>

          <section className="confirmation-grid">
            {confirmations.map((race) => (
              <article key={race.id} className="confirmation-card">
                <div className="confirmation-header">
                  <div>
                    <h3>{race.race}</h3>
                    <p className="muted">{race.track}</p>
                  </div>
                  <span className="badge">Pending</span>
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
                    <span>Countdown</span>
                    <strong>{race.countdown}</strong>
                  </div>
                </div>
                <div className="confirmation-actions">
                  <button className="primary-button">Confirm</button>
                  <button className="ghost-button">Reject</button>
                  <button className="ghost-button">View details</button>
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
