import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyHorses,
  inviteJockeyToHorse,
} from "../../services/ownerHorseApi";
import { getAvailableJockeys } from "../../services/jockeyApi";
import "../OwnerSharedLayout.css";
import "./OwnerHorseListPage.css";

const statusFilters = ["All", "Pending", "Approved", "Rejected"];
const approvalStatusMap = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};

const invitationStatusMap = {
  1: "Pending",
  2: "Accepted",
  3: "Declined",
};

const getInvitationStatus = (invitation) => {
  const status = invitation?.status ?? invitation?.Status;
  return typeof status === "number"
    ? invitationStatusMap[status] ?? "Pending"
    : status || "Pending";
};

const getJockeyName = (invitation) =>
  invitation?.jockey?.user?.fullName ??
  invitation?.Jockey?.User?.FullName ??
  invitation?.jockey?.user?.FullName ??
  invitation?.Jockey?.user?.fullName ??
  "Selected jockey";

const getHorseAssignment = (horse) => {
  const invitations = horse?.jockeyInvitations ?? horse?.JockeyInvitations ?? [];
  const activeInvitation = invitations.find((invitation) => {
    const status = getInvitationStatus(invitation).toLowerCase();
    return status === "pending" || status === "accepted";
  });

  if (activeInvitation) {
    const status = getInvitationStatus(activeInvitation);
    return {
      jockeyName: getJockeyName(activeInvitation),
      status,
      isLocked: true,
      label: status === "Accepted" ? "Assigned" : "Pending",
    };
  }

  if (horse?.assignedJockeyName) {
    return {
      jockeyName: horse.assignedJockeyName,
      status: horse.jockeyInvitationStatus || "Pending",
      isLocked: true,
      label: horse.jockeyInvitationStatus || "Pending",
    };
  }

  return null;
};

function OwnerHorseListPage() {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [jockeys, setJockeys] = useState([]);
  const [isJockeyLoading, setIsJockeyLoading] = useState(false);
  const [jockeyError, setJockeyError] = useState("");
  const [assignHorse, setAssignHorse] = useState(null);
  const [selectedJockeyId, setSelectedJockeyId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  const fetchJockeys = async () => {
    setIsJockeyLoading(true);
    setJockeyError("");

    try {
      const list = await getAvailableJockeys();
      setJockeys(list);
      setSelectedJockeyId((current) => current || list[0]?.id || "");

      if (list.length === 0) {
        setJockeyError(
          "API returned 0 jockeys. Please check whether jockey accounts exist in the Jockeys table.",
        );
      }
    } catch (fetchError) {
      const statusPrefix = fetchError?.status ? `HTTP ${fetchError.status}: ` : "";
      setJockeys([]);
      setJockeyError(
        `${statusPrefix}${fetchError?.message || "Unable to load jockeys."}`,
      );
    } finally {
      setIsJockeyLoading(false);
    }
  };

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

  useEffect(() => {
    fetchJockeys();
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

  const selectedJockey = jockeys.find((jockey) => jockey.id === selectedJockeyId);

  const openAssignModal = (horse = pageItems[0]) => {
    if (!horse) {
      return;
    }

    if (getHorseAssignment(horse)?.isLocked) {
      return;
    }

    setAssignHorse(horse);
    setAssignMessage("");
    setSelectedJockeyId((current) => current || jockeys[0]?.id || "");
    fetchJockeys();
  };

  const closeAssignModal = () => {
    if (isAssigning) {
      return;
    }

    setAssignHorse(null);
    setAssignMessage("");
  };

  const handleAssignJockey = async () => {
    if (!assignHorse || !selectedJockeyId) {
      setJockeyError("Please select a jockey.");
      return;
    }

    setIsAssigning(true);
    setJockeyError("");
    setAssignMessage("");

    try {
      await inviteJockeyToHorse(assignHorse.id, {
        jockeyId: selectedJockeyId,
      });

      const jockeyName = selectedJockey?.fullName || "Selected jockey";
      setHorses((current) =>
        current.map((horse) =>
          horse.id === assignHorse.id
            ? {
                ...horse,
                assignedJockeyName: jockeyName,
                jockeyInvitationStatus: "Pending",
              }
            : horse,
        ),
      );
      setAssignMessage(`Invitation sent to ${jockeyName}.`);
    } catch (assignError) {
      setJockeyError(assignError?.message || "Unable to assign jockey.");
    } finally {
      setIsAssigning(false);
    }
  };

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
                const assignment = getHorseAssignment(horse);
                const imageStyle = horse.imageUrl
                  ? { "--horse-image": `url(${horse.imageUrl})` }
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
                    </div>
                    <div className="horse-card__content">
                      <div className="horse-card__header">
                        <h3>{horse.name}</h3>
                        <p className="muted">
                          {horse.breed || "Unknown breed"}
                          {horse.color ? ` • ${horse.color}` : ""}
                        </p>
                        {assignment ? (
                          <span className="horse-card__jockey">
                            {assignment.jockeyName} · {assignment.label}
                          </span>
                        ) : null}
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
                          className="horse-action horse-action--primary"
                          to={`/owner/horses/${horse.id}`}
                        >
                          View Details
                        </Link>
                        <div className="horse-card__secondary-actions">
                          <Link
                            className="horse-action horse-action--edit"
                            to={`/owner/horses/${horse.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className={`horse-action horse-action--assign ${
                              assignment?.isLocked ? "horse-action--locked" : ""
                            }`}
                            onClick={() => openAssignModal(horse)}
                            disabled={assignment?.isLocked}
                          >
                            {assignment?.isLocked ? "Jockey assigned" : "Assign Jockey"}
                          </button>
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

      {assignHorse ? (
        <div
          className="assign-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-jockey-title"
        >
          <div className="assign-modal">
            <div className="assign-modal__header">
              <div>
                <span className="pill">Assign jockey</span>
                <h3 id="assign-jockey-title">{assignHorse.name}</h3>
              </div>
              <button
                className="assign-modal__close"
                type="button"
                onClick={closeAssignModal}
                aria-label="Close assign jockey modal"
              >
                ×
              </button>
            </div>

            <div className="assign-modal__body">
              {isJockeyLoading ? (
                <p className="muted">Loading jockeys...</p>
              ) : jockeyError && jockeys.length === 0 ? (
                <div className="assign-empty">
                  <h4>Unable to show jockeys</h4>
                  <p className="muted">{jockeyError}</p>
                </div>
              ) : jockeys.length === 0 ? (
                <div className="assign-empty">
                  <h4>No jockeys available</h4>
                  <p className="muted">
                    Jockey accounts from the API will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <label className="label-required" htmlFor="assign-jockey">
                    Available jockeys
                  </label>
                  <select
                    id="assign-jockey"
                    className="form-select"
                    value={selectedJockeyId}
                    onChange={(event) => setSelectedJockeyId(event.target.value)}
                  >
                    {jockeys.map((jockey) => (
                      <option key={jockey.id} value={jockey.id}>
                        {jockey.fullName} ·{" "}
                        {jockey.approvalStatusName || "Unknown"} ·{" "}
                        {jockey.winRate ?? 0}% win rate
                      </option>
                    ))}
                  </select>

                  {selectedJockey ? (
                    <div className="jockey-preview">
                      <div className="jockey-preview__avatar">
                        {selectedJockey.fullName?.slice(0, 1) || "J"}
                      </div>
                      <div>
                        <h4>{selectedJockey.fullName}</h4>
                        <p className="muted">
                          License {selectedJockey.licenseNumber || "N/A"} ·{" "}
                          {selectedJockey.nationality || "Unknown nationality"}
                        </p>
                      </div>
                      <div className="jockey-preview__stats">
                        <span>{selectedJockey.approvalStatusName || "Unknown"}</span>
                        <span>{selectedJockey.totalWins ?? 0} wins</span>
                        <span>{selectedJockey.totalRaces ?? 0} races</span>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {jockeyError && jockeys.length > 0 ? (
                <p className="form-error">{jockeyError}</p>
              ) : null}
              {assignMessage ? (
                <p className="assign-success">{assignMessage}</p>
              ) : null}
            </div>

            <div className="assign-modal__actions">
              <button
                className="horse-action horse-action--assign"
                type="button"
                onClick={handleAssignJockey}
                disabled={isAssigning || isJockeyLoading || jockeys.length === 0}
              >
                {isAssigning ? "Sending..." : "Send invitation"}
              </button>
              <button
                className="horse-action horse-action--edit"
                type="button"
                onClick={closeAssignModal}
                disabled={isAssigning}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OwnerHorseListPage;
