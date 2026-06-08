import { useEffect, useMemo, useState } from "react";
import { formatJockeyDate, getJockeyAssignedRaces } from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeySchedulePage.css";

const fallbackRaces = [
  {
    id: "sample-race-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    tournamentName: "Summer Racing Cup",
    status: "Assigned",
    jockeyConfirmed: true,
    ownerConfirmed: true,
    horseName: "Silver Comet",
    horseBreed: "Thoroughbred",
    horseGender: "Female",
    horseAge: 4,
    horseWeight: 462,
    horseHeight: 161,
    horseTotalRaces: 12,
    horseTotalWins: 4,
    distance: 1600,
    maxParticipants: 12,
  },
  {
    id: "sample-race-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    tournamentName: "Elite Track Series",
    status: "Scheduled",
    jockeyConfirmed: true,
    ownerConfirmed: false,
    horseName: "Midnight Runner",
    horseBreed: "Arabian",
    horseGender: "Male",
    horseAge: 5,
    horseWeight: 470,
    horseHeight: 164,
    horseTotalRaces: 18,
    horseTotalWins: 6,
    distance: 2000,
    maxParticipants: 10,
  },
];

function InfoRow({ label, value }) {
  return (
    <div className="jockey-schedule-info-row">
      <span>{label}</span>
      <strong>{value || "TBD"}</strong>
    </div>
  );
}

export function JockeySchedulePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const [detailMode, setDetailMode] = useState("race");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRaces = async () => {
      try {
        setLoading(true);
        const data = await getJockeyAssignedRaces();
        if (!cancelled) {
          setRaces(data);
          setSelectedRace(data[0] ?? null);
          setMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setSelectedRace(fallbackRaces[0]);
          setMessage(error.message || "Unable to load assigned races.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRaces();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRaces = useMemo(
    () =>
      [...races].sort((first, second) => {
        const firstTime = new Date(first.scheduledAt).getTime();
        const secondTime = new Date(second.scheduledAt).getTime();
        return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime);
      }),
    [races],
  );

  const calendarGroups = useMemo(() => {
    return sortedRaces.reduce((groups, race) => {
      const rawDate = new Date(race.scheduledAt);
      const key = Number.isNaN(rawDate.getTime())
        ? "Date TBD"
        : new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }).format(rawDate);
      return {
        ...groups,
        [key]: [...(groups[key] ?? []), race],
      };
    }, {});
  }, [sortedRaces]);

  const openDetail = (race, mode) => {
    setSelectedRace(race);
    setDetailMode(mode);
  };

  return (
    <div className="spectator-page jockey-schedule">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Race Schedule</p>
            <h3>Assigned rides</h3>
            <p className="muted">View horse info and race info.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Next race</p>
            <h4>{sortedRaces[0]?.title ?? "None booked"}</h4>
            <span>{formatJockeyDate(sortedRaces[0]?.scheduledAt, "Waiting")}</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-schedule-header">
            <div>
              <span className="pill">Assigned Races</span>
              <h1>Race Schedule</h1>
              <p>
                Track confirmed assignments, inspect race details, and review
                the horse profile for every ride.
              </p>
              {message ? <p className="jockey-schedule-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-schedule-layout">
            <div className="jockey-schedule-main">
              <div className="section-heading">
                <h2>Assigned Races</h2>
                <p>Each assignment includes the race card and assigned mount.</p>
              </div>

              {loading ? (
                <div className="jockey-schedule-loading">
                  <div className="skeleton-line wide" />
                  <div className="skeleton-line" />
                </div>
              ) : sortedRaces.length === 0 ? (
                <div className="jockey-schedule-empty">
                  <h3>No assigned races</h3>
                  <p className="muted">Accepted invitations will appear here.</p>
                </div>
              ) : (
                <div className="jockey-race-card-list">
                  {sortedRaces.map((race) => (
                    <article
                      key={race.id}
                      className={`jockey-race-card ${selectedRace?.id === race.id ? "jockey-race-card--active" : ""}`}
                    >
                      <div className="jockey-race-card__content">
                        <span className="badge">{race.status}</span>
                        <h3>{race.title}</h3>
                        <p className="muted">{race.tournamentName}</p>
                        <div className="jockey-race-card__meta">
                          <span>{formatJockeyDate(race.scheduledAt)}</span>
                          <span>{race.location}</span>
                          <span>{race.distance ? `${race.distance}m` : "Distance TBD"}</span>
                        </div>
                      </div>
                      <div className="jockey-race-card__horse">
                        <span>Horse</span>
                        <strong>{race.horseName}</strong>
                        <p className="muted">
                          {race.jockeyConfirmed ? "Jockey confirmed" : "Pending confirmation"}
                        </p>
                      </div>
                      <div className="jockey-race-card__actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => openDetail(race, "horse")}
                        >
                          View Horse Info
                        </button>
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => openDetail(race, "race")}
                        >
                          View Race Info
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="jockey-schedule-detail">
              <div className="jockey-detail-tabs">
                <button
                  type="button"
                  className={detailMode === "race" ? "active" : ""}
                  onClick={() => setDetailMode("race")}
                >
                  Race Info
                </button>
                <button
                  type="button"
                  className={detailMode === "horse" ? "active" : ""}
                  onClick={() => setDetailMode("horse")}
                >
                  Horse Info
                </button>
              </div>

              {!selectedRace ? (
                <p className="muted">Select an assigned race to view details.</p>
              ) : detailMode === "race" ? (
                <div className="jockey-schedule-detail__body">
                  <div className="section-heading">
                    <h2>{selectedRace.title}</h2>
                    <p>{selectedRace.tournamentName}</p>
                  </div>
                  <InfoRow label="Scheduled time" value={formatJockeyDate(selectedRace.scheduledAt)} />
                  <InfoRow label="Track" value={selectedRace.location} />
                  <InfoRow label="Status" value={selectedRace.status} />
                  <InfoRow label="Distance" value={selectedRace.distance ? `${selectedRace.distance}m` : ""} />
                  <InfoRow label="Participants" value={selectedRace.maxParticipants} />
                  <InfoRow label="Owner confirmed" value={selectedRace.ownerConfirmed ? "Yes" : "No"} />
                </div>
              ) : (
                <div className="jockey-schedule-detail__body">
                  <div className="section-heading">
                    <h2>{selectedRace.horseName}</h2>
                    <p>Assigned mount profile.</p>
                  </div>
                  <InfoRow label="Breed" value={selectedRace.horseBreed} />
                  <InfoRow label="Gender" value={selectedRace.horseGender} />
                  <InfoRow label="Age" value={selectedRace.horseAge} />
                  <InfoRow label="Weight" value={selectedRace.horseWeight} />
                  <InfoRow label="Height" value={selectedRace.horseHeight} />
                  <InfoRow label="Career" value={`${selectedRace.horseTotalWins || 0} wins / ${selectedRace.horseTotalRaces || 0} races`} />
                </div>
              )}
            </aside>
          </section>

          <section className="jockey-calendar-panel">
            <div className="section-heading">
              <h2>Race Calendar</h2>
              <p>Calendar grouping for all assigned race dates.</p>
            </div>
            <div className="jockey-calendar-list">
              {Object.entries(calendarGroups).map(([date, items]) => (
                <article key={date} className="jockey-calendar-day">
                  <h3>{date}</h3>
                  <div>
                    {items.map((race) => (
                      <button
                        key={race.id}
                        type="button"
                        onClick={() => openDetail(race, "race")}
                      >
                        <strong>{race.title}</strong>
                        <span>{race.location}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {!loading && Object.keys(calendarGroups).length === 0 ? (
                <p className="muted">No calendar entries yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeySchedulePage;
