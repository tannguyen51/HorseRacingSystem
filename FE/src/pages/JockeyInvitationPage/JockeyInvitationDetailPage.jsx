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
      <strong>{value || "Chưa xác định"}</strong>
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
          setMessage(error.message || "Không thể tải chi tiết lời mời.");
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
        state: { message: accept ? "Đã chấp nhận lời mời." : "Đã từ chối lời mời." },
      });
    } catch (error) {
      setMessage(error.message || "Không thể xử lý lời mời.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="spectator-page jockey-invitation-detail">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Chi Tiết Lời Mời</p>
            <h3>Xem lại cuộc đua</h3>
            <p className="muted">Xác nhận cuộc đua và ngựa trước khi phản hồi.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Trạng thái lời mời</p>
            <h4>{invitation?.status ?? "Đang tải..."}</h4>
            <span>{formatJockeyDate(invitation?.createdAt, "Ngày tạo chưa xác định")}</span>
          </div>
          <Link className="jockey-back-link" to="/jockey/invitations">
            Quay lại lời mời
          </Link>
        </aside>

        <div className="spectator-content">
          <section className="jockey-page-header">
            <div>
              <span className="pill">Chi Tiết Lời Mời</span>
              <h1>{invitation?.raceName ?? "Lời mời đua"}</h1>
              <p>
                Xem thông tin cuộc đua và ngựa, sau đó chấp nhận hoặc từ chối
                lời mời này.
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
              <h3>Không tìm thấy lời mời</h3>
              <p className="muted">Lời mời có thể đã được chấp nhận hoặc từ chối.</p>
            </div>
          ) : (
            <>
              <section className="jockey-detail-grid">
                <article className="jockey-detail-panel">
                  <div className="section-heading">
                    <h2>Thông Tin Cuộc Đua</h2>
                    <p>Chi tiết phân công cuộc đua chính thức.</p>
                  </div>
                  <DetailRow label="Cuộc đua" value={invitation.raceName} />
                  <DetailRow label="Giải đấu" value={invitation.tournamentName} />
                  <DetailRow
                    label="Thời gian dự kiến"
                    value={formatJockeyDate(invitation.scheduledAt)}
                  />
                  <DetailRow label="Đường đua" value={invitation.location} />
                  <DetailRow
                    label="Cự ly"
                    value={invitation.distance ? `${invitation.distance}m` : ""}
                  />
                  <DetailRow
                    label="Số người tham gia tối đa"
                    value={invitation.maxParticipants}
                  />
                </article>

                <article className="jockey-detail-panel">
                  <div className="section-heading">
                    <h2>Thông Tin Ngựa</h2>
                    <p>Hồ sơ ngựa được phân công cho lời mời này.</p>
                  </div>
                  <DetailRow label="Ngựa" value={invitation.horseName} />
                  <DetailRow label="Giống" value={invitation.horseBreed} />
                  <DetailRow label="Tuổi" value={invitation.horseAge} />
                  <DetailRow label="Cân nặng" value={invitation.horseWeight} />
                  <DetailRow label="Màu sắc" value={invitation.horseColor} />
                  <DetailRow label="Tỷ lệ thắng" value={horseWinRate} />
                </article>
              </section>

              <section className="jockey-response-panel">
                <div>
                  <h2>Phản hồi lời mời</h2>
                  <p className="muted">
                    Chấp nhận xác nhận bạn là kỵ sĩ cho cuộc đua này.
                  </p>
                </div>
                <div className="jockey-response-panel__actions">
                  <button
                    type="button"
                    className="ghost-button"
                    disabled={submitting}
                    onClick={() => handleResponse(false)}
                  >
                    Từ Chối Lời Mời
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    disabled={submitting}
                    onClick={() => handleResponse(true)}
                  >
                    {submitting ? "Đang xử lý..." : "Chấp Nhận Lời Mời"}
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
