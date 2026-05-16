import { useMemo, useState } from "react";
import "./SpectatorTournamentListPage.css";

const tournaments = [
  {
    id: 1,
    name: "Spring Championship Finals",
    date: "May 24, 2026 · 2:00 PM",
    totalRaces: 12,
    prizePool: "$500,000",
    status: "Live",
    location: "Churchill Downs",
  },
  {
    id: 2,
    name: "Pacific Classic Series",
    date: "June 12, 2026 · 4:30 PM",
    totalRaces: 9,
    prizePool: "$320,000",
    status: "Open",
    location: "Santa Anita Park",
  },
  {
    id: 3,
    name: "Bluegrass Invitational",
    date: "June 18, 2026 · 3:10 PM",
    totalRaces: 7,
    prizePool: "$210,000",
    status: "Filling Fast",
    location: "Keeneland",
  },
  {
    id: 4,
    name: "Harbor Stakes",
    date: "June 25, 2026 · 1:40 PM",
    totalRaces: 6,
    prizePool: "$180,000",
    status: "Open",
    location: "Del Mar",
  },
  {
    id: 5,
    name: "Metropolitan Mile",
    date: "July 2, 2026 · 2:20 PM",
    totalRaces: 8,
    prizePool: "$275,000",
    status: "Open",
    location: "Belmont Park",
  },
  {
    id: 6,
    name: "Coastal Derby",
    date: "July 9, 2026 · 5:00 PM",
    totalRaces: 10,
    prizePool: "$410,000",
    status: "Full",
    location: "Gulfstream Park",
  },
  {
    id: 7,
    name: "Emerald Invitational",
    date: "July 16, 2026 · 3:30 PM",
    totalRaces: 5,
    prizePool: "$150,000",
    status: "Open",
    location: "Emerald Downs",
  },
  {
    id: 8,
    name: "Capital Cup",
    date: "July 23, 2026 · 2:10 PM",
    totalRaces: 9,
    prizePool: "$295,000",
    status: "Filling Fast",
    location: "Laurel Park",
  },
];

const statusFilters = ["All", "Live", "Open", "Filling Fast", "Full"];

const sidebarLinks = [
  { label: "Dashboard", href: "/spectator" },
  { label: "Tournaments", href: "/spectator/tournaments" },
];

function SpectatorTournamentListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTournament, setActiveTournament] = useState(null);
  const pageSize = 6;

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
  }, [query, status]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredTournaments.length / pageSize),
  );
  const safePage = Math.min(currentPage, pageCount);
  const pageItems = filteredTournaments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
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
          <nav className="spectator-nav">
            {sidebarLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="spectator-nav__link"
              >
                {link.label}
              </a>
            ))}
          </nav>
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

          {pageItems.length === 0 ? (
            <div className="empty-state">
              <h3>No tournaments found</h3>
              <p>Try a different keyword or reset your filters.</p>
              <button
                className="ghost-button"
                onClick={() => {
                  setQuery("");
                  setStatus("All");
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
