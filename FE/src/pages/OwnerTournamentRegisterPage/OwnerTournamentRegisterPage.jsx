import { useState } from "react";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentRegisterPage.css";

const horses = [
  { id: 1, name: "Thunder Strike", status: "Active" },
  { id: 2, name: "Silver Comet", status: "Active" },
  { id: 3, name: "Midnight Runner", status: "Training" },
];

const tournaments = [
  { id: 1, name: "Pacific Classic Series", status: "Open" },
  { id: 2, name: "Capital Cup", status: "Open" },
  { id: 3, name: "Spring Championship Finals", status: "Live" },
];

const eligibilityChecks = [
  { label: "Age requirement", value: "Eligible" },
  { label: "Health status", value: "Cleared" },
  { label: "Speed rating", value: "Above minimum" },
  { label: "Registration slots", value: "Available" },
];

function OwnerTournamentRegisterPage() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="owner-page owner-tournament-register">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Register tournament</h3>
            <p className="muted">Submit your horse for tournament entry.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Open registrations</p>
            <h4>2 tournaments</h4>
            <span>Slots available</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Register tournament</h1>
            <p>Select a horse and confirm eligibility requirements.</p>
          </section>

          <section className="register-grid">
            <form className="register-form">
              <div className="form-field">
                <label className="label-required" htmlFor="select-horse">
                  Select horse
                </label>
                <select id="select-horse" className="form-select">
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} ({horse.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-tournament">
                  Select tournament
                </label>
                <select id="select-tournament" className="form-select">
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} ({tournament.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="register-actions">
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setShowConfirm(true)}
                >
                  Review registration
                </button>
                <button className="ghost-button" type="button">
                  Save draft
                </button>
              </div>
            </form>

            <div className="eligibility-card">
              <div className="section-heading">
                <h2>Eligibility check</h2>
                <p>Automatic validation for selected entry.</p>
              </div>
              <div className="eligibility-list">
                {eligibilityChecks.map((check) => (
                  <div key={check.label} className="eligibility-item">
                    <span>{check.label}</span>
                    <strong>{check.value}</strong>
                  </div>
                ))}
              </div>
              <div className="eligibility-note">
                <h4>Reminder</h4>
                <p className="muted">
                  Confirm race schedule and jockey availability before
                  submitting.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showConfirm ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
        >
          <div className="owner-modal">
            <div className="modal-header">
              <div>
                <span className="badge">Ready to submit</span>
                <h3 id="register-modal-title">Confirm registration</h3>
                <p className="muted">Review before submitting the entry.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setShowConfirm(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Horse</h4>
                <p>Thunder Strike</p>
              </div>
              <div>
                <h4>Tournament</h4>
                <p>Pacific Classic Series</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>Eligible</p>
              </div>
              <div>
                <h4>Slots</h4>
                <p>Available</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button">Submit registration</button>
              <button
                className="ghost-button"
                onClick={() => setShowConfirm(false)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OwnerTournamentRegisterPage;
