import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  formatJockeyDate,
  getJockeyInvitations,
  respondJockeyInvitation,
} from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyInvitationPage.css";

function DetailRow({ label, value }) {
  return (
    <div className="jockey-detail-row">
      <span>{label}</span>
      <strong>{value || "TBD"}</strong>
    </div>
  );
}

function JockeyInvitationDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(location.state?.invitation ?? null);
  const [loading, setLoading] = useState(!location.state?.invitation);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (invitation) return;
    let cancelled = false;

    const loadInvitation = async () => {
      try {
        setLoading(true);
        const data = await getJockeyInvitations();
        if (!cancelled) {
          setInvitation(data.find((item) => String(item.id) === String(id)) ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message || "Unable to load invitation detail.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInvitation();
    return () => {
      cancelled = true;
    };
  }, [id, invitation]);

  const horseWinRate = useMemo(() => {
    const totalRaces = Number(invitation?.horseTotalRaces || 0);
    const totalWins = Number(invitation?.horseTotalWins || 0);
    return totalRaces > 0 ? `${Math.round((totalWins / totalRaces) * 100)}%` : "0%";
  }, [invitation]);

  const handleResponse = async (accept) => {
    setSubmitting(true);
    try {
      await respondJockeyInvitation(id, accept);
      navigate("/jockey/invitations", {
        state: { message: accept ? "Invitation accepted." : "Invitation rejected." },
      });
    } catch (error) {
      setMessage(error.message || "Failed to process invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="spectator-page jockey-invitation-detail">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Invitation Detail</p>
            <h3>Race review</h3>
            <p className="muted">Confirm the race and horse before responding.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Invitation status</p>
            <h4>{invitation?.status ?? "Loading..."}</h4>
            <span>{formatJockeyDate(invitation?.createdAt, "Created date TBD")}</span>
          </div>
          <Link className="jockey-back-link" to="/jockey/invitations">
            Back to invitations
          </Link>
        </aside>

        <div className="spectator-content">
          <section className="jockey-page-header">
            <div>
              <span className="pill">Invitation Detail</span>
              <h1>{invitation?.raceName ?? "Race invitation"}</h1>
              <p>
                View race info and horse info, then accept or reject this
                invitation.
              </p>
              {message ? <p className="jockey-message">{message}</p> : null}
            </div>
          </section>

          {loading ? (
            <div className="jockey-loading-panel">
              <div className="skeleton-line wide" />
              <div className="skeleton-line" />
            </div>
          ) : !invitation ? (
            <div className="jockey-empty-state">
              <h3>Invitation not found</h3>
              <p className="muted">It may have already been accepted or rejected.</p>
            </div>
          ) : (
            <>
              <section className="jockey-detail-grid">
                <article className="jockey-detail-panel">
                  <div className="section-heading">
                    <h2>Race Info</h2>
                    <p>Official race assignment details.</p>
                  </div>
                  <DetailRow label="Race" value={invitation.raceName} />
                  <DetailRow label="Tournament" value={invitation.tournamentName} />
                  <DetailRow
                    label="Scheduled time"
                    value={formatJockeyDate(invitation.scheduledAt)}
                  />
                  <DetailRow label="Track" value={invitation.location} />
                  <DetailRow
                    label="Distance"
                    value={invitation.distance ? `${invitation.distance}m` : ""}
                  />
                  <DetailRow
                    label="Max participants"
                    value={invitation.maxParticipants}
                  />
                </article>

                <article className="jockey-detail-panel">
                  <div className="section-heading">
                    <h2>Horse Info</h2>
                    <p>Assigned mount profile for this invitation.</p>
                  </div>
                  <DetailRow label="Horse" value={invitation.horseName} />
                  <DetailRow label="Breed" value={invitation.horseBreed} />
                  <DetailRow label="Age" value={invitation.horseAge} />
                  <DetailRow label="Weight" value={invitation.horseWeight} />
                  <DetailRow label="Color" value={invitation.horseColor} />
                  <DetailRow label="Win rate" value={horseWinRate} />
                </article>
              </section>

              <section className="jockey-response-panel">
                <div>
                  <h2>Respond to invitation</h2>
                  <p className="muted">
                    Accepting confirms you as the jockey for this race entry.
                  </p>
                </div>
                <div className="jockey-response-panel__actions">
                  <button
                    type="button"
                    className="ghost-button"
                    disabled={submitting}
                    onClick={() => handleResponse(false)}
                  >
                    Reject Invitation
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={submitting}
                    onClick={() => handleResponse(true)}
                  >
                    {submitting ? "Processing..." : "Accept Invitation"}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default JockeyInvitationDetailPage;
