import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatJockeyDate,
  getJockeyInvitations,
  respondJockeyInvitation,
} from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyInvitationPage.css";

const fallbackInvitations = [
  {
    id: "sample-invitation-1",
    status: "Pending",
    raceName: "Bluegrass Sprint",
    scheduledAt: "2026-06-10T10:10:00Z",
    location: "Churchill Downs",
    tournamentName: "Summer Racing Cup",
    horseName: "Thunder Strike",
    horseBreed: "Thoroughbred",
    horseAge: 5,
  },
  {
    id: "sample-invitation-2",
    status: "Pending",
    raceName: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    tournamentName: "Elite Track Series",
    horseName: "Silver Comet",
    horseBreed: "Arabian",
    horseAge: 4,
  },
];

export function JockeyInvitationPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getJockeyInvitations();
      setInvitations(data);
      setMessage("");
    } catch (error) {
      setInvitations(fallbackInvitations);
      setMessage(error.message || "Unable to load invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const pendingInvitations = useMemo(
    () =>
      invitations.filter((invitation) =>
        String(invitation.status).toLowerCase().includes("pending"),
      ),
    [invitations],
  );

  const handleResponse = async (id, accept) => {
    setLoadingId(id);
    try {
      await respondJockeyInvitation(id, accept);
      setInvitations((current) =>
        current.filter((invitation) => invitation.id !== id),
      );
      setMessage(accept ? "Invitation accepted." : "Invitation rejected.");
    } catch (error) {
      setMessage(error.message || "Failed to process invitation.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="spectator-page jockey-invitations">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Invitation Management</p>
            <h3>Race offers</h3>
            <p className="muted">Accept or reject owner race invitations.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Pending invitations</p>
            <h4>{loading ? "Loading..." : pendingInvitations.length}</h4>
            <span>Requires response</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-page-header">
            <div>
              <span className="pill">Invitations</span>
              <h1>Invitation Management</h1>
              <p>
                Review race invitations, inspect assigned horses, and respond
                before the race card closes.
              </p>
              {message ? <p className="jockey-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-invitation-toolbar">
            <div>
              <span>All invitations</span>
              <strong>{loading ? "--" : invitations.length}</strong>
            </div>
            <div>
              <span>Pending</span>
              <strong>{loading ? "--" : pendingInvitations.length}</strong>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={loadInvitations}
              disabled={loading}
            >
              Refresh
            </button>
          </section>

          <section className="jockey-table-panel">
            <div className="section-heading">
              <h2>Invitations</h2>
              <p>Open the detail page for full horse and race information.</p>
            </div>

            {loading ? (
              <div className="jockey-loading-panel">
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="jockey-empty-state">
                <h3>No invitations</h3>
                <p className="muted">New invitations will appear here.</p>
              </div>
            ) : (
              <div className="jockey-invitation-list">
                {invitations.map((invitation) => (
                  <article key={invitation.id} className="jockey-invitation-card">
                    <div className="jockey-invitation-card__main">
                      <span className="badge">{invitation.status}</span>
                      <h3>{invitation.raceName}</h3>
                      <p className="muted">{invitation.tournamentName}</p>
                      <div className="jockey-invitation-meta">
                        <span>{formatJockeyDate(invitation.scheduledAt)}</span>
                        <span>{invitation.location}</span>
                        <span>Horse: {invitation.horseName}</span>
                      </div>
                    </div>

                    <div className="jockey-invitation-card__horse">
                      <span>Assigned horse</span>
                      <strong>{invitation.horseName}</strong>
                      <p className="muted">
                        {[invitation.horseBreed, invitation.horseAge && `${invitation.horseAge} years`]
                          .filter(Boolean)
                          .join(" / ") || "Profile pending"}
                      </p>
                    </div>

                    <div className="jockey-invitation-actions">
                      <Link
                        className="ghost-button"
                        to={`/jockey/invitations/${invitation.id}`}
                        state={{ invitation }}
                      >
                        View Detail
                      </Link>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(invitation.id, false)}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(invitation.id, true)}
                      >
                        {loadingId === invitation.id ? "Processing..." : "Accept"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeyInvitationPage;
