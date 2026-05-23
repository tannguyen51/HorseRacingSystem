import { useMemo, useState } from "react";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentListPage.css";

const tournaments = [
  {
    id: 1,
    name: "Spring Championship Finals",
    location: "Churchill Downs",
    prizePool: "$500,000",
    dates: "May 24 - May 28",
    status: "Live",
    slots: "2 slots",
  },
  {
    id: 2,
    name: "Pacific Classic Series",
    location: "Santa Anita",
    prizePool: "$320,000",
    dates: "June 12 - June 18",
    status: "Open",
    slots: "4 slots",
  },
  {
    id: 3,
    name: "Capital Cup",
    location: "Laurel Park",
    prizePool: "$280,000",
    dates: "June 22 - June 25",
    status: "Open",
    slots: "1 slot",
  },
  {
    id: 4,
    name: "Winter Cup",
    location: "Belmont Park",
    prizePool: "$210,000",
    dates: "July 2 - July 6",
    status: "Closed",
    slots: "Full",
  },
];

const statusFilters = ["All", "Live", "Open", "Closed"];

function OwnerTournamentListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [activeTournament, setActiveTournament] = useState(null);

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
  }, [query, status]);

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
            <h4>2</h4>
            <span>Available slots</span>
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

          <section className="tournament-grid">
            {filteredTournaments.map((tournament) => (
              <article key={tournament.id} className="owner-card hover-lift">
                <div className="tournament-banner">
                  <span className="badge">{tournament.status}</span>
                </div>
                <div className="tournament-body">
                  <div>
                    <h3>{tournament.name}</h3>
                    <p className="muted">{tournament.location}</p>
                    <p>{tournament.dates}</p>
                  </div>
                  <div className="tournament-meta">
                    <div>
                      <span>Prize pool</span>
                      <strong>{tournament.prizePool}</strong>
                    </div>
                    <div>
                      <span>Slots</span>
                      <strong>{tournament.slots}</strong>
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
                  <button className="primary-button">Register</button>
                </div>
              </article>
            ))}
          </section>
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
                <p className="muted">{activeTournament.location}</p>
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
                <h4>Prize pool</h4>
                <p>{activeTournament.prizePool}</p>
              </div>
              <div>
                <h4>Slots</h4>
                <p>{activeTournament.slots}</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>{activeTournament.status}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button">Register now</button>
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
