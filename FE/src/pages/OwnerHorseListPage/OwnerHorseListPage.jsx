import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyHorses } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "./OwnerHorseListPage.css";

const statusFilters = ["All", "Pending", "Approved", "Rejected"];
const approvalStatusMap = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};

function OwnerHorseListPage() {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchHorses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyHorses();
        if (isMounted) {
          setHorses(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || "Unable to load horses.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHorses();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusLabel = (horse) =>
    approvalStatusMap[horse.approvalStatus] ?? "Pending";

  const totalCount = horses.length;
  const pendingCount = horses.filter(
    (horse) => getStatusLabel(horse) === "Pending",
  ).length;

  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      const horseStatus = getStatusLabel(horse);
      const matchesStatus =
        status === "All" || horseStatus.toLowerCase() === status.toLowerCase();
      const matchesQuery = horse.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, status, horses]);

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
            <p className="muted">Total horses</p>
            <h4>{totalCount}</h4>
            <span>In your stable</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Pending approvals</p>
            <h4>{pendingCount}</h4>
            <span>Awaiting review</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Horse list</h1>
            <p>Manage horse profiles and upcoming entries.</p>
          </section>

          <section className="owner-actions">
            <Link className="primary-button" to="/owner/horses/new">
              Create horse
            </Link>
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

          {error ? <p className="form-error">{error}</p> : null}

          <section className="horse-grid">
            {isLoading ? (
              <p className="muted">Loading horses...</p>
            ) : (
              pageItems.map((horse) => {
                const statusLabel = getStatusLabel(horse);
                const imageStyle = horse.imageUrl
                  ? { backgroundImage: `url(${horse.imageUrl})` }
                  : undefined;
                return (
                  <article key={horse.id} className="horse-card hover-lift">
                    <div className="horse-media">
                      <div
                        className="horse-image"
                        style={imageStyle}
                        aria-hidden="true"
                      />
                      <span
                        className={`horse-status badge badge-${statusLabel.toLowerCase()}`}
                      >
                        {statusLabel}
                      </span>
                      <div className="horse-media__fade" />
                    </div>
                    <div className="horse-card__content">
                      <div className="horse-card__header">
                        <h3>{horse.name}</h3>
                        <p className="muted">
                          {horse.breed || "Unknown breed"}
                          {horse.color ? ` • ${horse.color}` : ""}
                        </p>
                      </div>
                      <div className="horse-card__details">
                        <div>
                          <span>Age</span>
                          <strong>{horse.age ?? "-"}</strong>
                        </div>
                        <div>
                          <span>Gender</span>
                          <strong>{horse.gender || "-"}</strong>
                        </div>
                        <div>
                          <span>Total wins</span>
                          <strong>{horse.totalWins ?? 0}</strong>
                        </div>
                        <div>
                          <span>Total races</span>
                          <strong>{horse.totalRaces ?? 0}</strong>
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
                );
              })
            )}
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
