import { useEffect, useMemo, useState } from "react";
import { unwrapResponseData } from "../../services/authRoleUtils";
import { getTournaments } from "../../services/spectatorApi";
import "../SpectatorSharedLayout.css";
import "./SpectatorTournamentListPage.css";

const statusFilters = ["All", "Live", "Open", "Closed"];

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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatPrizePool = (raceCount) => {
  if (!raceCount) {
    return "TBD";
  }
  const estimate = Math.max(1, raceCount) * 25000;
  return `$${estimate.toLocaleString("en-US")}`;
};

const getTournamentStatus = (tournament) => {
  const isActive = tournament?.isActive ?? tournament?.IsActive;
  if (!isActive) {
    return "Closed";
  }

  const start = new Date(tournament?.startDate ?? tournament?.StartDate);
  const end = new Date(tournament?.endDate ?? tournament?.EndDate);
  const now = new Date();

  if (
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    now >= start &&
    now <= end
  ) {
    return "Live";
  }

  return "Open";
};

const mapTournament = (tournament) => {
  const raceCount = tournament?.raceCount ?? tournament?.RaceCount ?? 0;
  const startDate = tournament?.startDate ?? tournament?.StartDate;

  return {
    id: tournament?.id ?? tournament?.Id,
    name: tournament?.name ?? tournament?.Name ?? "Tournament",
    date: formatDateTime(startDate),
    totalRaces: raceCount,
    prizePool: formatPrizePool(raceCount),
    status: getTournamentStatus(tournament),
    location:
      tournament?.description ?? tournament?.Description ?? "Location TBD",
  };
};

function SpectatorTournamentListPage() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTournament, setActiveTournament] = useState(null);
  const basePageSize = 6;
  const fullPageSize = 8;

  useEffect(() => {
    let cancelled = false;

    const loadTournaments = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getTournaments();
        const payload = unwrapResponseData(response);
        const items = Array.isArray(payload) ? payload.map(mapTournament) : [];

        if (!cancelled) {
          setTournaments(items);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load tournaments.");
          setTournaments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTournaments();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesStatus =
        status === "All" ||
        tournament.status.toLowerCase() === status.toLowerCase();
      const matchesQuery =
        tournament.name.toLowerCase().includes(query.toLowerCase()) ||
        tournament.location.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [tournaments, query, status]);

  const effectivePageSize =
    filteredTournaments.length <= fullPageSize
      ? filteredTournaments.length
      : basePageSize;
  const pageCount = Math.max(
    1,
    Math.ceil(filteredTournaments.length / effectivePageSize),
  );
  const safePage = Math.min(currentPage, pageCount);
  const pageItems = filteredTournaments.slice(
    (safePage - 1) * effectivePageSize,
    safePage * effectivePageSize,
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(pageCount, prev + 1));
  };

  return (
    <div className="spectator-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Tournament Finder</h3>
            <p className="muted">Browse upcoming and live events.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Filters</p>
            <h4>{status}</h4>
            <span>{filteredTournaments.length} tournaments</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Spectator Tournaments</h1>
            <p>Search live tournaments and plan your next watchlist.</p>
          </section>

          <section className="spectator-filters">
            <div className="filter-group">
              <label htmlFor="search" className="label-required">
                Search
              </label>
              <input
                id="search"
                className="form-input"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search tournaments or locations"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="status" className="label-required">
                Status
              </label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setCurrentPage(1);
                }}
              >
                {statusFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {isLoading ? (
            <div className="empty-state">
              <h3>Loading tournaments</h3>
              <p>Fetching the latest tournament schedule.</p>
            </div>
          ) : errorMessage ? (
            <div className="empty-state">
              <h3>Unable to load tournaments</h3>
              <p>{errorMessage}</p>
              <button
                className="ghost-button"
                onClick={() => location.reload()}
              >
                Try again
              </button>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="empty-state">
              <h3>No tournaments found</h3>
              <p>Try a different keyword or reset your filters.</p>
              <button
                className="ghost-button"
                onClick={() => {
                  setQuery("");
                  setStatus("All");
                  setCurrentPage(1);
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <section className="tournament-grid">
              {pageItems.map((tournament) => (
                <article
                  key={tournament.id}
                  className="spectator-card hover-lift"
                >
                  <div className="tournament-banner">
                    <span className="badge">{tournament.status}</span>
                  </div>
                  <div className="tournament-body">
                    <div>
                      <h3>{tournament.name}</h3>
                      <p className="muted">{tournament.date}</p>
                      <p>{tournament.location}</p>
                    </div>
                    <div className="tournament-meta">
                      <div>
                        <span>Total races</span>
                        <strong>{tournament.totalRaces}</strong>
                      </div>
                      <div>
                        <span>Prize pool</span>
                        <strong>{tournament.prizePool}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="tournament-actions">
                    <button
                      className="ghost-button"
                      onClick={() => setActiveTournament(tournament)}
                    >
                      View details
                    </button>
                    <button
                      className="primary-button"
                      type="button"
                      disabled
                      title="Follow is not available yet"
                    >
                      Follow
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {pageCount > 1 ? (
            <div className="pagination">
              <button
                className="ghost-button"
                onClick={handlePrevious}
                disabled={safePage === 1}
              >
                Previous
              </button>
              <span>
                Page {safePage} of {pageCount}
              </span>
              <button
                className="ghost-button"
                onClick={handleNext}
                disabled={safePage === pageCount}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {activeTournament ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="spectator-tournament-dialog-title"
        >
          <div className="spectator-modal">
            <div className="modal-header">
              <div>
                <span className="badge">{activeTournament.status}</span>
                <h3 id="spectator-tournament-dialog-title">
                  {activeTournament.name}
                </h3>
                <p className="muted">{activeTournament.date}</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setActiveTournament(null)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Location</h4>
                <p>{activeTournament.location}</p>
              </div>
              <div>
                <h4>Total races</h4>
                <p>{activeTournament.totalRaces}</p>
              </div>
              <div>
                <h4>Prize pool</h4>
                <p>{activeTournament.prizePool}</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>{activeTournament.status}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button">Follow tournament</button>
              <button
                className="ghost-button"
                onClick={() => setActiveTournament(null)}
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

export default SpectatorTournamentListPage;
