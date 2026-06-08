import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerTournaments } from "../../services/ownerApi";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentListPage.css";

const statusFilters = ["All", "Live", "Open", "Closed"];

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "TBD"
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const getTournamentStatus = (tournament) => {
  if (!(tournament?.isActive ?? tournament?.IsActive)) {
    return "Closed";
  }

  const start = new Date(tournament?.startDate ?? tournament?.StartDate);
  const end = new Date(tournament?.endDate ?? tournament?.EndDate);
  const now = new Date();

  return !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    now >= start &&
    now <= end
    ? "Live"
    : "Open";
};

const mapTournament = (tournament) => {
  const startDate = tournament?.startDate ?? tournament?.StartDate;
  const endDate = tournament?.endDate ?? tournament?.EndDate;

  return {
    id: tournament?.id ?? tournament?.Id,
    name: tournament?.name ?? tournament?.Name ?? "Tournament",
    description:
      tournament?.description ?? tournament?.Description ?? "No description.",
    dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    status: getTournamentStatus(tournament),
    raceCount: tournament?.raceCount ?? tournament?.RaceCount ?? 0,
    roundCount: tournament?.roundCount ?? tournament?.RoundCount ?? 0,
  };
};

function OwnerTournamentListPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeTournament, setActiveTournament] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadTournaments = async () => {
      try {
        const payload = await getOwnerTournaments();
        if (!cancelled) {
          setTournaments(Array.isArray(payload) ? payload.map(mapTournament) : []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Unable to load tournaments.");
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
      const matchesQuery = tournament.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, status, tournaments]);

  return (
    <div className="owner-page owner-tournament-list">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Tournament list</h3>
            <p className="muted">Discover upcoming opportunities.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Open tournaments</p>
            <h4>
              {tournaments.filter((tournament) => tournament.status === "Open").length}
            </h4>
            <span>{tournaments.length} total tournaments</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Owner tournaments</h1>
            <p>Search tournaments and plan your entries.</p>
          </section>

          <section className="owner-filters">
            <div className="filter-group">
              <label htmlFor="tournament-search" className="label-required">
                Search tournaments
              </label>
              <input
                id="tournament-search"
                className="form-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by tournament name"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="tournament-status" className="label-required">
                Status
              </label>
              <select
                id="tournament-status"
                className="form-select"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
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
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="empty-state">
              <h3>No tournaments found</h3>
              <p>Try a different keyword or status.</p>
            </div>
          ) : (
            <section className="tournament-grid">
              {filteredTournaments.map((tournament) => (
              <article key={tournament.id} className="owner-card hover-lift">
                <div className="tournament-banner">
                  <span className="badge">{tournament.status}</span>
                </div>
                <div className="tournament-body">
                  <div>
                    <h3>{tournament.name}</h3>
                    <p className="muted">{tournament.description}</p>
                    <p>{tournament.dates}</p>
                  </div>
                  <div className="tournament-meta">
                    <div>
                      <span>Races</span>
                      <strong>{tournament.raceCount}</strong>
                    </div>
                    <div>
                      <span>Rounds</span>
                      <strong>{tournament.roundCount}</strong>
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
                    onClick={() => navigate("/owner/register-tournament")}
                  >
                    Register
                  </button>
                </div>
              </article>
              ))}
            </section>
          )}
        </div>
      </div>

      {activeTournament ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tournament-modal-title"
        >
          <div className="owner-modal">
            <div className="modal-header">
              <div>
                <span className="badge">{activeTournament.status}</span>
                <h3 id="tournament-modal-title">{activeTournament.name}</h3>
                <p className="muted">{activeTournament.description}</p>
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
                <h4>Dates</h4>
                <p>{activeTournament.dates}</p>
              </div>
              <div>
                <h4>Races</h4>
                <p>{activeTournament.raceCount}</p>
              </div>
              <div>
                <h4>Rounds</h4>
                <p>{activeTournament.roundCount}</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>{activeTournament.status}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="primary-button"
                onClick={() => navigate("/owner/register-tournament")}
              >
                Register now
              </button>
              <button
                className="ghost-button"
                onClick={() => setActiveTournament(null)}
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

export default OwnerTournamentListPage;
