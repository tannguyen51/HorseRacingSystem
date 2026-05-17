import { useEffect, useMemo, useState } from "react";
import { unwrapResponseData } from "../../services/authRoleUtils";
import {
  createPrediction,
  getRace,
  getRaces,
  getTournaments,
} from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorPredictionFormPage.css";

const formatCountdown = (value) => {
  if (!value) {
    return "--:--";
  }
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "--:--";
  }
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return "Started";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

function SpectatorPredictionFormPage() {
  const [tournaments, setTournaments] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedHorseId, setSelectedHorseId] = useState(null);
  const [raceDetail, setRaceDetail] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [tournamentsResponse, racesResponse] = await Promise.all([
          getTournaments(),
          getRaces(),
        ]);
        const tournamentPayload = unwrapResponseData(tournamentsResponse);
        const racesPayload = unwrapResponseData(racesResponse);

        const tournamentItems = Array.isArray(tournamentPayload)
          ? tournamentPayload
          : [];
        const raceItems = Array.isArray(racesPayload) ? racesPayload : [];

        if (!cancelled) {
          setTournaments(tournamentItems);
          setRaces(raceItems);
          if (tournamentItems.length > 0) {
            const firstTournamentId =
              tournamentItems[0]?.id ?? tournamentItems[0]?.Id;
            setSelectedTournament(firstTournamentId ?? "");
          }
          if (raceItems.length > 0) {
            const firstRaceId = raceItems[0]?.id ?? raceItems[0]?.Id;
            setSelectedRace(firstRaceId ?? "");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load predictions data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadRaceDetail = async () => {
      if (!selectedRace) {
        setRaceDetail(null);
        return;
      }

      setIsLoading(true);
      setSubmitError("");

      try {
        const response = await getRace(selectedRace);
        const payload = unwrapResponseData(response);
        if (!cancelled) {
          setRaceDetail(payload ?? null);
          setSelectedHorseId(null);
        }
      } catch (error) {
        if (!cancelled) {
          setRaceDetail(null);
          setSubmitError(error.message || "Unable to load race details.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRaceDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedRace]);

  const raceOptions = useMemo(() => {
    return races.map((race) => {
      const id = race?.id ?? race?.Id;
      const name = race?.name ?? race?.Name ?? "Race";
      const scheduledAt = race?.scheduledAt ?? race?.ScheduledAt;
      return {
        id,
        name,
        time: formatDateTime(scheduledAt),
        countdown: formatCountdown(scheduledAt),
      };
    });
  }, [races]);

  const selectedRaceDetails = raceOptions.find(
    (race) => race.id === selectedRace,
  );

  const horseOptions = useMemo(() => {
    const entries = raceDetail?.entries ?? raceDetail?.Entries ?? [];
    return entries.map((entry) => ({
      id: entry?.horseId ?? entry?.HorseId,
      name: entry?.horse?.name ?? entry?.Horse?.Name ?? "Unknown",
      jockey: "Jockey TBD",
      odds: "TBD",
      form: "Form pending",
    }));
  }, [raceDetail]);

  const selectedHorse = horseOptions.find(
    (horse) => horse.id === selectedHorseId,
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitError("");
    if (selectedHorseId) {
      setShowConfirmation(true);
    }
  };

  const handleConfirm = async () => {
    if (!selectedRace || !selectedHorseId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createPrediction({
        raceId: selectedRace,
        predictedHorseId: selectedHorseId,
      });
      setShowConfirmation(false);
    } catch (error) {
      setSubmitError(error.message || "Unable to submit prediction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="spectator-page spectator-prediction-form-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Prediction Desk</h3>
            <p className="muted">Lock in your winner picks.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Countdown</p>
            <h4>{selectedRaceDetails?.name || "Select a race"}</h4>
            <span>{selectedRaceDetails?.countdown || "--:--"}</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Prediction Form</h1>
            <p>Choose a race, pick a winner, and submit your odds.</p>
          </section>

          <section className="prediction-layout">
            <form className="prediction-form" onSubmit={handleSubmit}>
              <div className="prediction-form__grid">
                <div className="form-group">
                  <label htmlFor="tournament" className="label-required">
                    Tournament
                  </label>
                  <select
                    id="tournament"
                    className="form-select"
                    value={selectedTournament}
                    onChange={(event) =>
                      setSelectedTournament(event.target.value)
                    }
                  >
                    {tournaments.map((option) => (
                      <option
                        key={option.id ?? option.Id}
                        value={option.id ?? option.Id}
                      >
                        {option.name ?? option.Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="race" className="label-required">
                    Race
                  </label>
                  <select
                    id="race"
                    className="form-select"
                    value={selectedRace}
                    onChange={(event) => setSelectedRace(event.target.value)}
                  >
                    {raceOptions.map((race) => (
                      <option key={race.id} value={race.id}>
                        {race.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="prediction-section">
                <div className="section-heading">
                  <h2>Select a horse</h2>
                  <p>Tap a horse card to lock your prediction.</p>
                </div>

                {isLoading ? (
                  <div className="empty-state">
                    <h4>Loading entries</h4>
                    <p>Fetching horses for the selected race.</p>
                  </div>
                ) : horseOptions.length === 0 ? (
                  <div className="empty-state">
                    <h4>No horses available</h4>
                    <p>Pick a different race to see entries.</p>
                  </div>
                ) : (
                  <div className="horse-grid">
                    {horseOptions.map((horse) => (
                      <button
                        key={horse.id}
                        type="button"
                        className={`horse-card hover-lift ${
                          selectedHorseId === horse.id
                            ? "horse-card--active"
                            : ""
                        }`}
                        onClick={() => setSelectedHorseId(horse.id)}
                      >
                        <div>
                          <h3>{horse.name}</h3>
                          <p className="muted">{horse.jockey}</p>
                        </div>
                        <div className="horse-card__meta">
                          <span>Odds</span>
                          <strong>{horse.odds}</strong>
                        </div>
                        <div className="horse-card__form">
                          <span>Recent form</span>
                          <p>{horse.form}</p>
                        </div>
                      </button>
                    ))}
                    {isLoading ? (
                      <div className="horse-card skeleton-card">
                        <div className="skeleton-line" />
                        <div className="skeleton-line wide" />
                        <div className="skeleton-line" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="prediction-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!selectedHorseId || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit prediction"}
                </button>
                <button type="button" className="ghost-button">
                  Save for later
                </button>
              </div>
            </form>

            <aside className="prediction-summary">
              <div>
                <span className="pill">Race countdown</span>
                <h3>{selectedRaceDetails?.countdown || "--:--"}</h3>
                <p className="muted">
                  {selectedRaceDetails?.time || "Select a race"}
                </p>
              </div>
              <div className="summary-card">
                <div>
                  <span>Track</span>
                  <strong>{raceDetail?.location || "--"}</strong>
                </div>
                <div>
                  <span>Selected horse</span>
                  <strong>{selectedHorse?.name || "None"}</strong>
                </div>
                <div>
                  <span>Odds</span>
                  <strong>{selectedHorse?.odds || "--"}</strong>
                </div>
              </div>
              <div className="summary-note">
                <h4>Prediction rules</h4>
                <p>
                  Predictions lock 5 minutes before the race starts. Rewards are
                  calculated from live odds.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </div>

      {showConfirmation ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prediction-confirmation-title"
        >
          <div className="spectator-modal">
            <div className="modal-header">
              <div>
                <span className="badge">Prediction ready</span>
                <h3 id="prediction-confirmation-title">Confirm prediction</h3>
                <p className="muted">
                  Review your selection before submitting.
                </p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setShowConfirmation(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Tournament</h4>
                <p>
                  {tournaments.find(
                    (option) => (option.id ?? option.Id) === selectedTournament,
                  )?.name ??
                    tournaments.find(
                      (option) =>
                        (option.id ?? option.Id) === selectedTournament,
                    )?.Name}
                </p>
              </div>
              <div>
                <h4>Race</h4>
                <p>{selectedRaceDetails?.name}</p>
              </div>
              <div>
                <h4>Horse</h4>
                <p>{selectedHorse?.name}</p>
              </div>
              <div>
                <h4>Odds</h4>
                <p>{selectedHorse?.odds}</p>
              </div>
              {submitError ? (
                <div className="form-error">{submitError}</div>
              ) : null}
            </div>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm prediction"}
              </button>
              <button
                className="ghost-button"
                onClick={() => setShowConfirmation(false)}
              >
                Edit selection
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SpectatorPredictionFormPage;
