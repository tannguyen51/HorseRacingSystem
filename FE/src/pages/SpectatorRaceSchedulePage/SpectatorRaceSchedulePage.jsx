import { useEffect, useMemo, useState } from "react";
import { unwrapResponseData } from "../../services/authRoleUtils";
import { getRace, getRaces } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorRaceSchedulePage.css";

const formatDate = (value) => {
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
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return "TBD";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatCountdown = (value) => {
  if (!value) {
    return "TBD";
  }
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "TBD";
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

const mapRaceSummary = (race) => {
  const scheduledAt = race?.scheduledAt ?? race?.ScheduledAt;
  return {
    id: race?.id ?? race?.Id,
    title: race?.name ?? race?.Name ?? "Race",
    scheduledAt,
    timeLabel: formatTime(scheduledAt),
    dateLabel: formatDate(scheduledAt),
    status: race?.status ?? race?.Status ?? "Scheduled",
    track: race?.location ?? race?.Location ?? "Track TBD",
  };
};

function SpectatorRaceSchedulePage() {
  const [activeRace, setActiveRace] = useState(null);
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadRaces = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getRaces();
        const payload = unwrapResponseData(response);
        const items = Array.isArray(payload) ? payload.map(mapRaceSummary) : [];

        if (!cancelled) {
          setRaces(items);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load race schedule.");
          setRaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRaces();

    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleDays = useMemo(() => {
    const grouped = races.reduce((acc, race) => {
      const dateKey = race.dateLabel;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        ...race,
        countdown: formatCountdown(race.scheduledAt),
      });
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, dayRaces]) => ({
        date,
        races: dayRaces.sort(
          (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt),
        ),
      }))
      .sort(
        (a, b) =>
          new Date(a.races[0]?.scheduledAt) - new Date(b.races[0]?.scheduledAt),
      );
  }, [races]);

  const upcomingRaces = useMemo(() => {
    return races
      .filter((race) => new Date(race.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
      .slice(0, 3)
      .map((race) => ({
        ...race,
        time: `${race.dateLabel} · ${race.timeLabel}`,
        countdown: formatCountdown(race.scheduledAt),
        status: race.status,
      }));
  }, [races]);

  const scheduleHighlights = useMemo(() => {
    const liveCount = races.filter(
      (race) => race.status?.toLowerCase() === "inprogress",
    ).length;
    const upcomingCount = races.filter(
      (race) => new Date(race.scheduledAt) > new Date(),
    ).length;
    const nextRace = upcomingRaces[0]?.countdown ?? "TBD";

    return [
      { label: "Live races", value: String(liveCount), detail: "On track" },
      {
        label: "Upcoming races",
        value: String(upcomingCount),
        detail: "Next 48 hours",
      },
      { label: "Next countdown", value: nextRace, detail: "Until start" },
    ];
  }, [races, upcomingRaces]);

  const scheduleOverview = useMemo(() => {
    const statusCounts = races.reduce(
      (counts, race) => {
        const status = String(race.status || "").toLowerCase();

        if (status === "inprogress" || status === "started") {
          counts.live += 1;
        } else if (status === "finished" || status === "completed") {
          counts.finished += 1;
        } else {
          counts.scheduled += 1;
        }

        return counts;
      },
      { scheduled: 0, live: 0, finished: 0 },
    );

    return [
      { label: "Scheduled", value: statusCounts.scheduled, tone: "scheduled" },
      { label: "Live now", value: statusCounts.live, tone: "live" },
      { label: "Finished", value: statusCounts.finished, tone: "finished" },
    ];
  }, [races]);

  const handleOpenRace = async (race) => {
    setActiveRace({ ...race, isLoading: true, horses: [] });

    try {
      const response = await getRace(race.id);
      const detail = unwrapResponseData(response);
      const entries = detail?.entries ?? detail?.Entries ?? [];
      const horses = entries.map((entry) => ({
        id: entry?.horseId ?? entry?.HorseId,
        name: entry?.horse?.name ?? entry?.Horse?.Name ?? "Unknown",
        jockey:
          entry?.jockey?.user?.fullName ??
          entry?.Jockey?.User?.FullName ??
          "Jockey TBD",
        gate: entry?.status ?? entry?.Status ?? "Pending",
        odds: "TBD",
      }));

      setActiveRace({
        ...race,
        title: detail?.name ?? detail?.Name ?? race.title,
        track: detail?.location ?? detail?.Location ?? race.track,
        scheduledAt:
          detail?.scheduledAt ?? detail?.ScheduledAt ?? race.scheduledAt,
        timeLabel: formatTime(detail?.scheduledAt ?? detail?.ScheduledAt),
        dateLabel: formatDate(detail?.scheduledAt ?? detail?.ScheduledAt),
        status: detail?.status ?? detail?.Status ?? race.status,
        horses,
        isLoading: false,
      });
    } catch (error) {
      setActiveRace({
        ...race,
        error: error.message || "Unable to load race details.",
        horses: [],
        isLoading: false,
      });
    }
  };

  const hasSchedule = scheduleDays.length > 0;

  return (
    <div className="spectator-page spectator-schedule-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Race Schedule</h3>
            <p className="muted">Track upcoming heats and live starts.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Next start</p>
            <h4>{upcomingRaces[0]?.title || "No upcoming race"}</h4>
            <span>
              {upcomingRaces[0]
                ? `Countdown ${upcomingRaces[0].countdown}`
                : "Schedule is up to date"}
            </span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Spectator Race Schedule</h1>
            <p>Timelines, tracks, and live countdowns for every heat.</p>
          </section>

          <section className="schedule-highlights">
            {scheduleHighlights.map((item) => (
              <article key={item.label} className="stat-card hover-lift">
                <p className="muted">{item.label}</p>
                <h3>{item.value}</h3>
                <span className="stat-detail">{item.detail}</span>
              </article>
            ))}
          </section>

          <section className="schedule-layout">
            <div className="schedule-timeline">
              <div className="section-heading">
                <h2>Schedule timeline</h2>
                <p>Stay ahead of the next race window.</p>
              </div>

              {!hasSchedule ? (
                <div className="empty-state">
                  <h4>
                    {isLoading
                      ? "Loading schedule"
                      : errorMessage
                        ? "Unable to load schedule"
                        : "No schedule available"}
                  </h4>
                  <p>
                    {errorMessage || "Check back later for updated race times."}
                  </p>
                  <button
                    className="ghost-button"
                    onClick={() => location.reload()}
                  >
                    Refresh schedule
                  </button>
                </div>
              ) : (
                scheduleDays.map((day) => (
                  <div key={day.date} className="schedule-day">
                    <div className="schedule-day__header">
                      <h3>{day.date}</h3>
                      <span className="muted">
                        {day.races.length} races scheduled
                      </span>
                    </div>
                    <div className="schedule-day__list">
                      {day.races.map((race) => (
                        <article
                          key={race.id}
                          className="schedule-entry hover-lift"
                        >
                          <div className="schedule-entry__header">
                            <div>
                              <p className="schedule-time">{race.time}</p>
                              <h3>{race.title}</h3>
                              <p className="muted">{race.track}</p>
                            </div>
                            <div className="schedule-entry__status">
                              <span className="badge">{race.status}</span>
                              <span className="countdown-pill">
                                {race.countdown}
                              </span>
                            </div>
                          </div>
                          <div className="schedule-entry__meta">
                            <div>
                              <span>Race time</span>
                              <strong>
                                {day.date} · {race.time}
                              </strong>
                            </div>
                            <div>
                              <span>Horse count</span>
                              <strong>{race.horses?.length ?? "-"}</strong>
                            </div>
                          </div>
                          <div className="schedule-entry__horses">
                            <span className="muted">
                              Open details to view participants.
                            </span>
                          </div>
                          <div className="schedule-entry__actions">
                            <button
                              className="ghost-button"
                              onClick={() =>
                                handleOpenRace({
                                  ...race,
                                  dateLabel: day.date,
                                  timeLabel: race.timeLabel,
                                })
                              }
                            >
                              View details
                            </button>
                            <button className="primary-button" type="button">
                              Set reminder
                            </button>
                          </div>
                        </article>
                      ))}
                      {isLoading ? (
                        <article className="schedule-entry skeleton-card">
                          <div className="skeleton-line" />
                          <div className="skeleton-line wide" />
                          <div className="skeleton-line" />
                        </article>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            <aside className="schedule-sidepanel">
              <div className="section-heading">
                <h2>Upcoming races</h2>
                <p>Your race-day overview.</p>
              </div>
              <div className="upcoming-list">
                {upcomingRaces.map((race) => (
                  <article key={race.id} className="upcoming-card hover-lift">
                    <div>
                      <span className="badge">{race.status}</span>
                      <h4>{race.title}</h4>
                      <p className="muted">{race.time}</p>
                      <span>{race.track}</span>
                    </div>
                    <div className="upcoming-card__countdown">
                      <p className="muted">Countdown</p>
                      <strong>{race.countdown}</strong>
                      <button
                        className="ghost-button"
                        onClick={() => handleOpenRace(race)}
                      >
                        View details
                      </button>
                    </div>
                  </article>
                ))}
                {!isLoading && upcomingRaces.length === 0 ? (
                  <div className="upcoming-empty">
                    <span className="upcoming-empty__icon" aria-hidden="true">
                      ✓
                    </span>
                    <div>
                      <h4>You're all caught up</h4>
                      <p>
                        There are no future races on the calendar yet. New
                        starts will appear here automatically.
                      </p>
                    </div>
                  </div>
                ) : null}
                {isLoading ? (
                  <article className="upcoming-card skeleton-card">
                    <div className="skeleton-line" />
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line" />
                  </article>
                ) : null}
              </div>

              <div className="schedule-overview-card">
                <div className="sidepanel-card__heading">
                  <div>
                    <span className="sidepanel-eyebrow">Schedule overview</span>
                    <h3>Race status</h3>
                  </div>
                  <span className="overview-total">{races.length} total</span>
                </div>
                <div className="schedule-overview-list">
                  {scheduleOverview.map((item) => (
                    <div key={item.label} className="schedule-overview-row">
                      <span
                        className={`status-indicator status-indicator--${item.tone}`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="race-day-guide">
                <span className="sidepanel-eyebrow">Race day guide</span>
                <h3>Never miss the start</h3>
                <div className="race-day-guide__steps">
                  <div>
                    <span>01</span>
                    <p>Open race details to review the track and runners.</p>
                  </div>
                  <div>
                    <span>02</span>
                    <p>Set a reminder before the countdown reaches zero.</p>
                  </div>
                  <div>
                    <span>03</span>
                    <p>Follow Live Ranking once the race is underway.</p>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>

      {activeRace ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="race-detail-title"
        >
          <div className="spectator-modal schedule-modal">
            <div className="modal-header">
              <div>
                <span className="badge">{activeRace.status}</span>
                <h3 id="race-detail-title">{activeRace.title}</h3>
                <p className="muted">
                  {activeRace.track || "Track info pending"}
                </p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setActiveRace(null)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Race time</h4>
                <p>
                  {activeRace.dateLabel ? `${activeRace.dateLabel} · ` : ""}
                  {activeRace.timeLabel || "TBD"}
                </p>
              </div>
              <div>
                <h4>Countdown</h4>
                <p>{activeRace.countdown || "Updating"}</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>{activeRace.status}</p>
              </div>
              <div>
                <h4>Track</h4>
                <p>{activeRace.track}</p>
              </div>
            </div>
            {activeRace.isLoading ? (
              <div className="empty-state">
                <h4>Loading participants</h4>
                <p>Fetching race entries.</p>
              </div>
            ) : activeRace.error ? (
              <div className="empty-state">
                <h4>Unable to load participants</h4>
                <p>{activeRace.error}</p>
              </div>
            ) : activeRace.horses && activeRace.horses.length > 0 ? (
              <div className="participant-grid">
                {activeRace.horses.map((horse) => (
                  <div
                    key={horse.id || horse.name}
                    className="participant-card"
                  >
                    <h5>{horse.name}</h5>
                    <p className="muted">{horse.jockey}</p>
                    <div className="participant-meta">
                      <span>{horse.gate}</span>
                      <span>{horse.odds} odds</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h4>Participants loading</h4>
                <p>Horse entries will appear closer to start time.</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="primary-button">Notify me</button>
              <button
                className="ghost-button"
                onClick={() => setActiveRace(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SpectatorRaceSchedulePage;
