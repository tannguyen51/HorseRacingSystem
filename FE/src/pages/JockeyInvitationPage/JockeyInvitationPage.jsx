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
      setMessage(error.message || "Không thể tải lời mời.");
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
      setMessage(accept ? "Đã chấp nhận lời mời." : "Đã từ chối lời mời.");
    } catch (error) {
      setMessage(error.message || "Không thể xử lý lời mời.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="spectator-page jockey-invitations">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Quản Lý Lời Mời</p>
            <h3>Đề nghị đua</h3>
            <p className="muted">Chấp nhận hoặc từ chối lời mời đua từ chủ ngựa.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Lời mời đang chờ</p>
            <h4>{loading ? "Đang tải..." : pendingInvitations.length}</h4>
            <span>Cần phản hồi</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-page-header">
            <div>
              <span className="pill">Lời Mời</span>
              <h1>Quản Lý Lời Mời</h1>
              <p>
                Xem lời mời đua, kiểm tra ngựa được phân công và phản hồi
                trước khi danh sách đua đóng.
              </p>
              {message ? <p className="jockey-message">{message}</p> : null}
            </div>
          </section>

          <section className="jockey-invitation-toolbar">
            <div>
              <span>Tất cả lời mời</span>
              <strong>{loading ? "--" : invitations.length}</strong>
            </div>
            <div>
              <span>Đang chờ</span>
              <strong>{loading ? "--" : pendingInvitations.length}</strong>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={loadInvitations}
              disabled={loading}
            >
              Làm mới
            </button>
          </section>

          <section className="jockey-table-panel">
            <div className="section-heading">
              <h2>Lời Mời</h2>
              <p>Mở trang chi tiết để xem đầy đủ thông tin ngựa và cuộc đua.</p>
            </div>

            {loading ? (
              <div className="jockey-loading-panel">
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="jockey-empty-state">
                <h3>Không có lời mời</h3>
                <p className="muted">Lời mời mới sẽ xuất hiện tại đây.</p>
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
                        <span>Ngựa: {invitation.horseName}</span>
                      </div>
                    </div>

                    <div className="jockey-invitation-card__horse">
                      <span>Ngựa được phân công</span>
                      <strong>{invitation.horseName}</strong>
                      <p className="muted">
                        {[invitation.horseBreed, invitation.horseAge && `${invitation.horseAge} tuổi`]
                          .filter(Boolean)
                          .join(" / ") || "Hồ sơ đang chờ"}
                      </p>
                    </div>

                    <div className="jockey-invitation-actions">
                      <Link
                        className="ghost-button"
                        to={`/jockey/invitations/${invitation.id}`}
                        state={{ invitation }}
                      >
                        Xem Chi Tiết
                      </Link>
                      <button
                        type="button"
                        className="ghost-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(invitation.id, false)}
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        className="primary-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(invitation.id, true)}
                      >
                        {loadingId === invitation.id ? "Đang xử lý..." : "Chấp nhận"}
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
