import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "../../services/spectatorApi";
import "./TournamentListPage.css";

function TournamentListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournaments()
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = items.filter((t) => t.isActive ?? t.IsActive).length;

  return (
    <div className="tournament-list-page">
      <div className="tournament-layout">
        <aside className="tournament-sidebar">
          <div className="tournament-sidebar__header">
            <span className="pill">Danh Sách Giải Đấu</span>
            <h3>Duyệt sự kiện</h3>
            <p className="muted">Khám phá các mùa giải, vòng đấu và quy mô cuộc đua.</p>
          </div>
          <div className="tournament-sidebar__card">
            <p className="muted">Đang diễn ra</p>
            <h4>{activeCount}</h4>
            <span>{items.length} tổng số giải đấu</span>
          </div>
        </aside>

        <div className="tournament-content">
          <section className="page-header tournament-hero">
            <h1>Giải Đấu</h1>
            <p>
              Duyệt tất cả các giải đấu đua ngựa, mùa giải đang hoạt động và quy mô cuộc đua.
            </p>
          </section>

          {loading ? (
            <div className="empty-state">
              <h3>Đang tải giải đấu</h3>
              <p>Đang lấy lịch đua và thông tin cuộc đua mới nhất.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>Không tìm thấy giải đấu</h3>
              <p>Hiện không có giải đấu nào để hiển thị.</p>
            </div>
          ) : (
            <div className="tournament-list">
              {items.map((t) => (
                <article key={t.id ?? t.Id} className="tournament-card">
                  <div className="tournament-banner">
                    <span
                      className={
                        (t.isActive ?? t.IsActive)
                          ? "status-pill status-pill--active"
                          : "status-pill"
                      }
                    >
                      {(t.isActive ?? t.IsActive) ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                  <div className="tournament-body">
                    <div>
                      <h3>{t.name ?? t.Name}</h3>
                      <p>
                        {t.description ??
                          t.Description ??
                          "Không có mô tả."}
                      </p>
                    </div>
                    <div className="tournament-meta">
                      <div>
                        <span>Vòng đấu</span>
                        <strong>{t.roundCount ?? t.RoundCount ?? 0}</strong>
                      </div>
                      <div>
                        <span>Cuộc đua</span>
                        <strong>{t.raceCount ?? t.RaceCount ?? 0}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="tournament-actions">
                    <Link
                      className="ghost-button"
                      to={`/tournaments/${t.id ?? t.Id}`}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TournamentListPage;
