import { useMemo, useState } from "react";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentRegisterPage.css";

const horses = [
  { id: 1, name: "Thunder Strike", status: "Approved", age: 5, rating: 92 },
  { id: 2, name: "Silver Comet", status: "Approved", age: 4, rating: 88 },
  { id: 3, name: "Midnight Runner", status: "Training", age: 3, rating: 81 },
];

const tournaments = [
  {
    id: 1,
    name: "Pacific Classic Series",
    status: "Open",
    track: "Gulfstream Park",
    date: "June 18, 2026",
    slots: 8,
  },
  {
    id: 2,
    name: "Capital Cup",
    status: "Open",
    track: "Capital Downs",
    date: "June 25, 2026",
    slots: 4,
  },
  {
    id: 3,
    name: "Spring Championship Finals",
    status: "Closing soon",
    track: "Santa Anita",
    date: "July 2, 2026",
    slots: 2,
  },
];

const initialRegistrations = [
  {
    id: 1,
    horse: "Silver Comet",
    tournament: "Capital Cup",
    status: "Pending review",
    submitted: "June 3, 2026",
  },
  {
    id: 2,
    horse: "Thunder Strike",
    tournament: "Pacific Classic Series",
    status: "Approved",
    submitted: "June 1, 2026",
  },
];

function OwnerTournamentRegisterPage() {
  const [selectedHorseId, setSelectedHorseId] = useState(horses[0].id);
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    tournaments[0].id,
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrations, setRegistrations] = useState(initialRegistrations);

  const selectedHorse = useMemo(
    () => horses.find((horse) => horse.id === Number(selectedHorseId)),
    [selectedHorseId],
  );

  const selectedTournament = useMemo(
    () =>
      tournaments.find(
        (tournament) => tournament.id === Number(selectedTournamentId),
      ),
    [selectedTournamentId],
  );

  const eligibilityChecks = [
    {
      label: "Horse approval",
      value: selectedHorse?.status === "Approved" ? "Ready" : "Review needed",
      tone: selectedHorse?.status === "Approved" ? "success" : "warning",
    },
    {
      label: "Age requirement",
      value: selectedHorse?.age >= 3 ? "Eligible" : "Too young",
      tone: selectedHorse?.age >= 3 ? "success" : "warning",
    },
    {
      label: "Performance rating",
      value: `${selectedHorse?.rating ?? "-"} points`,
      tone: selectedHorse?.rating >= 85 ? "success" : "warning",
    },
    {
      label: "Tournament slots",
      value: `${selectedTournament?.slots ?? 0} available`,
      tone: selectedTournament?.slots > 0 ? "success" : "warning",
    },
  ];

  const handleSubmitRegistration = () => {
    setRegistrations((current) => [
      {
        id: Date.now(),
        horse: selectedHorse.name,
        tournament: selectedTournament.name,
        status: "Pending review",
        submitted: "June 4, 2026",
      },
      ...current,
    ]);
    setShowConfirm(false);
  };

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
            <h4>{tournaments.length} tournaments</h4>
            <span>Slots available</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Tracked entries</p>
            <h4>{registrations.length} requests</h4>
            <span>Mock status board</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Register horse into tournament</h1>
            <p>Select a horse, review eligibility, and track each request.</p>
          </section>

          <section className="register-grid">
            <form className="register-form">
              <div className="register-form__heading">
                <span className="pill">New registration</span>
                <h2>Tournament entry</h2>
                <p>Mock flow only. API integration can be added later.</p>
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-horse">
                  Select horse
                </label>
                <select
                  id="select-horse"
                  className="form-select"
                  value={selectedHorseId}
                  onChange={(event) => setSelectedHorseId(event.target.value)}
                >
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} · {horse.status} · Rating {horse.rating}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-tournament">
                  Select tournament
                </label>
                <select
                  id="select-tournament"
                  className="form-select"
                  value={selectedTournamentId}
                  onChange={(event) =>
                    setSelectedTournamentId(event.target.value)
                  }
                >
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} · {tournament.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="selection-summary">
                <div>
                  <span>Horse</span>
                  <strong>{selectedHorse?.name}</strong>
                  <p>{selectedHorse?.age} years · {selectedHorse?.rating} rating</p>
                </div>
                <div>
                  <span>Tournament</span>
                  <strong>{selectedTournament?.name}</strong>
                  <p>{selectedTournament?.track} · {selectedTournament?.date}</p>
                </div>
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
                <p>Preview for the currently selected entry.</p>
              </div>
              <div className="eligibility-list">
                {eligibilityChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`eligibility-item eligibility-item--${check.tone}`}
                  >
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

          <section className="registration-status">
            <div className="section-heading">
              <h2>Registration status</h2>
              <p>Track tournament requests submitted by your stable.</p>
            </div>
            <div className="registration-table">
              {registrations.map((registration) => (
                <article key={registration.id} className="registration-row">
                  <div>
                    <span>Horse</span>
                    <strong>{registration.horse}</strong>
                  </div>
                  <div>
                    <span>Tournament</span>
                    <strong>{registration.tournament}</strong>
                  </div>
                  <div>
                    <span>Submitted</span>
                    <strong>{registration.submitted}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong
                      className={`registration-status-pill registration-status-pill--${registration.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {registration.status}
                    </strong>
                  </div>
                </article>
              ))}
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
                <p>{selectedHorse?.name}</p>
              </div>
              <div>
                <h4>Tournament</h4>
                <p>{selectedTournament?.name}</p>
              </div>
              <div>
                <h4>Track</h4>
                <p>{selectedTournament?.track}</p>
              </div>
              <div>
                <h4>Slots</h4>
                <p>{selectedTournament?.slots} available</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={handleSubmitRegistration}
              >
                Submit registration
              </button>
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
