import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../OwnerSharedLayout.css";
import "./OwnerHorseListPage.css";

const horses = [
  {
    id: 1,
    name: "Thunder Strike",
    age: 4,
    breed: "Thoroughbred",
    speed: 94,
    status: "Active",
    jockey: "Ariana Blake",
    upcomingRace: "Emerald Invitational",
  },
  {
    id: 2,
    name: "Silver Comet",
    age: 5,
    breed: "Arabian",
    speed: 91,
    status: "Active",
    jockey: "Drew Hamilton",
    upcomingRace: "Coastal Derby",
  },
  {
    id: 3,
    name: "Midnight Runner",
    age: 3,
    breed: "Quarter Horse",
    speed: 88,
    status: "Training",
    jockey: "Maya Ortiz",
    upcomingRace: "Golden Mile",
  },
  {
    id: 4,
    name: "Crimson Tide",
    age: 6,
    breed: "Thoroughbred",
    speed: 86,
    status: "Resting",
    jockey: "TBD",
    upcomingRace: "TBD",
  },
  {
    id: 5,
    name: "Velvet Arrow",
    age: 4,
    breed: "Arabian",
    speed: 90,
    status: "Active",
    jockey: "Sebastian Cole",
    upcomingRace: "Capital Cup",
  },
  {
    id: 6,
    name: "Aurora Bloom",
    age: 5,
    breed: "Thoroughbred",
    speed: 87,
    status: "Medical",
    jockey: "TBD",
    upcomingRace: "TBD",
  },
  {
    id: 7,
    name: "Iron Halo",
    age: 3,
    breed: "Quarter Horse",
    speed: 89,
    status: "Training",
    jockey: "TBD",
    upcomingRace: "TBD",
  },
];

const statusFilters = ["All", "Active", "Training", "Resting", "Medical"];

function OwnerHorseListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      const matchesStatus =
        status === "All" || horse.status.toLowerCase() === status.toLowerCase();
      const matchesQuery = horse.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredHorses.length / pageSize));
  const pageItems = filteredHorses.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="owner-page owner-horse-list">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Horse management</h3>
            <p className="muted">Search, edit, and track your stable.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Active horses</p>
            <h4>4</h4>
            <span>Across 3 races</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Next vet check</p>
            <h4>May 20</h4>
            <span>Thunder Strike</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Horse list</h1>
            <p>Manage horse profiles and upcoming entries.</p>
          </section>

          <section className="owner-actions">
            <button className="primary-button">Create horse</button>
            <button className="ghost-button">Assign jockey</button>
            <button className="ghost-button">Export roster</button>
          </section>

          <section className="owner-filters">
            <div className="filter-group">
              <label htmlFor="horse-search" className="label-required">
                Search horse
              </label>
              <input
                id="horse-search"
                className="form-input"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by horse name"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="horse-status" className="label-required">
                Status
              </label>
              <select
                id="horse-status"
                className="form-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
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

          <section className="horse-grid">
            {pageItems.map((horse) => (
              <article key={horse.id} className="horse-card hover-lift">
                <div className="horse-media">
                  <div className="horse-image" aria-hidden="true" />
                  <span
                    className={`horse-status badge badge-${horse.status.toLowerCase()}`}
                  >
                    {horse.status}
                  </span>
                  <div className="horse-media__fade" />
                </div>
                <div className="horse-card__content">
                  <div className="horse-card__header">
                    <h3>{horse.name}</h3>
                    <p className="muted">{horse.breed}</p>
                  </div>
                  <div className="horse-card__details">
                    <div>
                      <span>Age</span>
                      <strong>{horse.age}</strong>
                    </div>
                    <div>
                      <span>Speed rating</span>
                      <strong>{horse.speed}</strong>
                    </div>
                    <div>
                      <span>Assigned jockey</span>
                      <strong>{horse.jockey}</strong>
                    </div>
                    <div>
                      <span>Upcoming race</span>
                      <strong>{horse.upcomingRace}</strong>
                    </div>
                  </div>
                  <div className="horse-card__actions">
                    <Link
                      className="primary-button button-block"
                      to={`/owner/horses/${horse.id}`}
                    >
                      View Details
                    </Link>
                    <div className="horse-card__secondary-actions">
                      <Link
                        className="ghost-button button-outline"
                        to={`/owner/horses/${horse.id}/edit`}
                      >
                        Edit
                      </Link>
                      <Link
                        className="ghost-button button-outline"
                        to={`/owner/horses/${horse.id}/edit`}
                      >
                        Assign Jockey
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="pagination">
            <button
              className="ghost-button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              className="ghost-button"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              Next
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseListPage;
