import { useEffect, useMemo, useState } from "react";
import { unwrapResponseData } from "../../services/authRoleUtils";
import { getLiveRanking, getRaces } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorLiveRankingPage.css";

const formatTimeTaken = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }
  const totalSeconds = Math.max(0, Math.floor(value));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

function SpectatorLiveRankingPage() {
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [rankingData, setRankingData] = useState({
    raceName: "",
    rankings: [],
  });
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
        const items = Array.isArray(payload) ? payload : [];

        if (!cancelled) {
          setRaces(items);
          if (items.length > 0) {
            const firstRaceId = items[0]?.id ?? items[0]?.Id;
            setSelectedRaceId(firstRaceId ?? "");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load races.");
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

  useEffect(() => {
    let cancelled = false;

    const loadRanking = async () => {
      if (!selectedRaceId) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getLiveRanking(selectedRaceId);
        const payload = unwrapResponseData(response);
        const rankings = payload?.rankings ?? payload?.Rankings ?? [];
        if (!cancelled) {
          setRankingData({
            raceName: payload?.raceName ?? payload?.RaceName ?? "",
            rankings,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load ranking data.");
          setRankingData({ raceName: "", rankings: [] });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadRanking();

    return () => {
      cancelled = true;
    };
  }, [selectedRaceId]);

  const raceOptions = useMemo(() => {
    return races.map((race) => ({
      id: race?.id ?? race?.Id,
      label: race?.name ?? race?.Name ?? "Race",
    }));
  }, [races]);

  const rankings = rankingData.rankings ?? [];
  const topThree = rankings.slice(0, 3);
  const jockeyRows = rankings.filter((entry) => entry?.jockeyName);

  const statCards = [
    {
      label: "Live positions",
      value: String(rankings.length),
      detail: "In the current race",
    },
    {
      label: "Race status",
      value: rankingData.raceName ? "Live" : "Pending",
      detail: "Updated moments ago",
    },
    {
      label: "Finishers",
      value: String(rankings.filter((entry) => entry?.won).length),
      detail: "Marked as winners",
    },
  ];

  return (
    <div className="spectator-page spectator-ranking-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Live Ranking</h3>
            <p className="muted">Realtime leaderboard insights.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Current race</p>
            <h4>{rankingData.raceName || "Select a race"}</h4>
            <span>Live standings</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Live Ranking</h1>
            <p>Follow live point changes for horses and jockeys.</p>
          </section>

          <section className="ranking-filters">
            <div className="filter-group">
              <label htmlFor="race" className="label-required">
                Race
              </label>
              <select
                id="race"
                className="form-select"
                value={selectedRaceId}
                onChange={(event) => setSelectedRaceId(event.target.value)}
              >
                {raceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="ranking-stats">
            {statCards.map((stat) => (
              <article key={stat.label} className="stat-card hover-lift">
                <p className="muted">{stat.label}</p>
                <h3>{stat.value}</h3>
                <span className="stat-detail">{stat.detail}</span>
              </article>
            ))}
          </section>

          <section className="top-rank-grid">
            {topThree.map((entry, index) => (
              <article
                key={entry.horseId ?? entry.position}
                className={`top-rank-card top-rank-card--${index + 1} hover-lift`}
              >
                <div className="top-rank-header">
                  <span className="badge">Top {index + 1}</span>
                  <span
                    className={`ranking-change ${
                      entry.won
                        ? "ranking-change--up"
                        : "ranking-change--steady"
                    }`}
                  >
                    {entry.won ? "+1" : "-"}
                  </span>
                </div>
                <h3>{entry.horseName ?? "Unknown"}</h3>
                <p className="muted">{entry.jockeyName ?? "Jockey TBD"}</p>
                <div className="top-rank-meta">
                  <div>
                    <span>Position</span>
                    <strong>{entry.position}</strong>
                  </div>
                  <div>
                    <span>Time</span>
                    <strong>{formatTimeTaken(entry.timeTaken)}</strong>
                  </div>
                </div>
              </article>
            ))}
            {isLoading ? (
              <article className="top-rank-card skeleton-card">
                <div className="skeleton-line" />
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
              </article>
            ) : null}
          </section>

          <section className="ranking-columns">
            <div className="spectator-section">
              <div className="section-heading">
                <h2>Horse rankings</h2>
                <p>Live points and win totals.</p>
              </div>
              {rankings.length === 0 ? (
                <div className="empty-state">
                  <h4>No rankings yet</h4>
                  <p>Standings will appear once the race starts.</p>
                </div>
              ) : (
                <div className="ranking-table">
                  <div className="table-row table-header">
                    <span>Rank</span>
                    <span>Horse</span>
                    <span>Jockey</span>
                    <span>Time</span>
                    <span>Status</span>
                  </div>
                  {rankings.map((row) => (
                    <div key={row.position} className="table-row">
                      <span className="rank-pill">{row.position}</span>
                      <span>{row.horseName ?? "Unknown"}</span>
                      <span className="muted">{row.jockeyName ?? "-"}</span>
                      <span className="rating">
                        {formatTimeTaken(row.timeTaken)}
                      </span>
                      <span className="muted">
                        {row.won ? "Winner" : "Running"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="spectator-section">
              <div className="section-heading">
                <h2>Jockey rankings</h2>
                <p>Race points and win statistics.</p>
              </div>
              {jockeyRows.length === 0 ? (
                <div className="empty-state">
                  <h4>No jockey standings</h4>
                  <p>Check back after the next heat finishes.</p>
                </div>
              ) : (
                <div className="ranking-table">
                  <div className="table-row table-header">
                    <span>Rank</span>
                    <span>Jockey</span>
                    <span>Horse</span>
                    <span>Time</span>
                    <span>Status</span>
                  </div>
                  {jockeyRows.map((row) => (
                    <div key={row.position} className="table-row">
                      <span className="rank-pill">{row.position}</span>
                      <span>{row.jockeyName ?? "Jockey TBD"}</span>
                      <span className="muted">{row.horseName ?? "-"}</span>
                      <span className="rating">
                        {formatTimeTaken(row.timeTaken)}
                      </span>
                      <span className="muted">
                        {row.won ? "Winner" : "Running"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SpectatorLiveRankingPage;
