import { useEffect, useMemo, useState } from "react";
import { getMyHorses, registerHorseForRace } from "../../services/ownerHorseApi";
import { getOwnerTournaments } from "../../services/ownerApi";
import { getTournamentRaces } from "../../services/adminApi";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentRegisterPage.css";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "TBD"
    : new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const mapTournament = (tournament) => ({
  id: tournament?.id ?? tournament?.Id,
  name: tournament?.name ?? tournament?.Name ?? "Tournament",
  status: (tournament?.isActive ?? tournament?.IsActive) ? "Open" : "Closed",
  description:
    tournament?.description ?? tournament?.Description ?? "No description.",
  date: formatDate(tournament?.startDate ?? tournament?.StartDate),
  raceCount: tournament?.raceCount ?? tournament?.RaceCount ?? 0,
});

function OwnerTournamentRegisterPage() {
  const [tournaments, setTournaments] = useState([]);
  const [horses, setHorses] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [isHorseLoading, setIsHorseLoading] = useState(true);
  const [horseError, setHorseError] = useState("");
  const [isTournamentLoading, setIsTournamentLoading] = useState(true);
  const [tournamentError, setTournamentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const loadRaces = async () => {
    if (!selectedTournamentId) { setRaces([]); return; }
    try {
      const data = await getTournamentRaces(selectedTournamentId);
      setRaces(Array.isArray(data) ? data : []);
    } catch { setRaces([]); }
  };

  useEffect(() => { loadRaces(); }, [selectedTournamentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;

    const fetchOwnerData = async () => {
      setIsHorseLoading(true);
      setIsTournamentLoading(true);
      setHorseError("");
      setTournamentError("");

      try {
        const data = await getMyHorses();
        const approvedHorses = (Array.isArray(data) ? data : []).filter(
          (horse) =>
            horse.approvalStatus === 2 || horse.approvalStatus === "Approved",
        );

        if (isMounted) {
          setHorses(approvedHorses);
          setSelectedHorseId(approvedHorses[0]?.id ?? "");
        }
      } catch (fetchError) {
        if (isMounted) {
          setHorses([]);
          setSelectedHorseId("");
          setHorseError(fetchError?.message || "Unable to load approved horses.");
        }
      } finally {
        if (isMounted) {
          setIsHorseLoading(false);
        }
      }

      try {
        const data = await getOwnerTournaments();
        const openTournaments = (Array.isArray(data) ? data : [])
          .map(mapTournament)
          .filter((tournament) => tournament.status === "Open");

        if (isMounted) {
          setTournaments(openTournaments);
          setSelectedTournamentId(openTournaments[0]?.id ?? "");
        }
      } catch (fetchError) {
        if (isMounted) {
          setTournaments([]);
          setSelectedTournamentId("");
          setTournamentError(
            fetchError?.message || "Unable to load open tournaments.",
          );
        }
      } finally {
        if (isMounted) {
          setIsTournamentLoading(false);
        }
      }
    };

    fetchOwnerData();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedHorse = useMemo(
    () => horses.find((horse) => horse.id === selectedHorseId),
    [horses, selectedHorseId],
  );

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournamentId),
    [selectedTournamentId, tournaments],
  );

  const eligibilityChecks = [
    {
      label: "Horse approval",
      value: selectedHorse ? "Approved" : "No horse selected",
      tone: selectedHorse ? "success" : "warning",
    },
    {
      label: "Age requirement",
      value: selectedHorse?.age >= 3 ? "Eligible" : "Too young",
      tone: selectedHorse?.age >= 3 ? "success" : "warning",
    },
    {
      label: "Race record",
      value: selectedHorse
        ? `${selectedHorse.totalWins ?? 0} wins / ${selectedHorse.totalRaces ?? 0} races`
        : "-",
      tone: selectedHorse ? "success" : "warning",
    },
    {
      label: "Tournament races",
      value: selectedTournament
        ? `${selectedTournament.raceCount} races scheduled`
        : "No tournament selected",
      tone: selectedTournament ? "success" : "warning",
    },
  ];

  const handleSubmitRegistration = async () => {
    if (!selectedHorse || !selectedTournament || !selectedRaceId) return;
    setIsSubmitting(true);
    setMsg("");
    try {
      await registerHorseForRace(selectedHorse.id, selectedRaceId, {});
      setRegistrations((current) => [
        {
          id: Date.now(),
          horse: selectedHorse.name,
          tournament: selectedTournament.name,
          race: races.find((r) => (r.id ?? r.Id) === selectedRaceId)?.name ?? selectedRaceId,
          status: "Pending review",
          submitted: new Date().toISOString().slice(0, 10),
        },
        ...current,
      ]);
      setMsg("Registration submitted successfully!");
    } catch (err) {
      if (err.message?.includes("already registered")) {
        setMsg("This horse is already registered for this race. Please choose a different horse or a different race.");
      } else {
        setMsg("Error: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
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
                <p>Only approved horses are available for registration.</p>
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
                  disabled={isHorseLoading || horses.length === 0}
                >
                  {isHorseLoading ? (
                    <option value="">Loading approved horses...</option>
                  ) : horses.length === 0 ? (
                    <option value="">No approved horses available</option>
                  ) : null}
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} · Approved · {horse.age ?? "-"} years
                    </option>
                  ))}
                </select>
                {horseError ? <p className="form-error">{horseError}</p> : null}
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
                  disabled={isTournamentLoading || tournaments.length === 0}
                >
                  {isTournamentLoading ? (
                    <option value="">Loading open tournaments...</option>
                  ) : tournaments.length === 0 ? (
                    <option value="">No open tournaments available</option>
                  ) : null}
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} · {tournament.status}
                    </option>
                  ))}
                </select>
                {tournamentError ? (
                  <p className="form-error">{tournamentError}</p>
                ) : null}
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-race">
                  Select race
                </label>
                <select
                  id="select-race"
                  className="form-select"
                  value={selectedRaceId}
                  onChange={(event) => setSelectedRaceId(event.target.value)}
                  disabled={!selectedTournamentId || races.length === 0}
                >
                  {!selectedTournamentId ? (
                    <option value="">Select a tournament first</option>
                  ) : races.length === 0 ? (
                    <option value="">No races available</option>
                  ) : (
                    <option value="">-- Choose a race --</option>
                  )}
                  {races.map((race) => (
                    <option key={race.id ?? race.Id} value={race.id ?? race.Id}>
                      {race.name ?? race.Name} · {race.status ?? race.Status ?? "Scheduled"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="selection-summary">
                <div>
                  <span>Horse</span>
                  <strong>{selectedHorse?.name ?? "No approved horse"}</strong>
                  <p>
                    {selectedHorse
                      ? `${selectedHorse.age ?? "-"} years · ${selectedHorse.totalWins ?? 0} wins / ${selectedHorse.totalRaces ?? 0} races`
                      : "An approved horse is required."}
                  </p>
                </div>
                <div>
                  <span>Tournament</span>
                  <strong>{selectedTournament?.name ?? "No open tournament"}</strong>
                  <p>
                    {selectedTournament
                      ? `${selectedTournament.description} · ${selectedTournament.date}`
                      : "An open tournament is required."}
                  </p>
                </div>
              </div>
              <div className="register-actions">
                {msg && <p className={msg.startsWith("Error") ? "form-error" : "form-success"}>{msg}</p>}
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={!selectedHorse || !selectedTournament || !selectedRaceId || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Review registration"}
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
                <h4>Description</h4>
                <p>{selectedTournament?.description}</p>
              </div>
              <div>
                <h4>Races</h4>
                <p>{selectedTournament?.raceCount} scheduled</p>
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
