import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getHorse } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "./OwnerHorseDetailPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5226";

const getHorseImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

function OwnerHorseDetailPage() {
  const { id } = useParams();
  const [horse, setHorse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const approvalStatusMap = useMemo(
    () => ({
      1: "Chờ duyệt",
      2: "Đã duyệt",
      3: "Từ chối",
    }),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const fetchHorse = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getHorse(id);
        if (isMounted) {
          setHorse(data || null);
          if (!data) {
            setError("Không tìm thấy ngựa.");
          }
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || "Không thể tải chi tiết ngựa.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHorse();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const statusLabel = horse
    ? (approvalStatusMap[horse.approvalStatus] ?? "Chờ duyệt")
    : "Chờ duyệt";

  const formattedDob = horse?.dateOfBirth
    ? new Date(horse.dateOfBirth).toLocaleDateString()
    : "-";
  const imageUrl = getHorseImageUrl(horse?.imageUrl);
  const winRate =
    horse?.totalRaces > 0
      ? Math.round(((horse.totalWins ?? 0) / horse.totalRaces) * 100)
      : 0;

  const primaryDetails = horse
    ? [
        { label: "Giống", value: horse.breed || "-" },
        { label: "Giới tính", value: horse.gender || "-" },
        { label: "Màu sắc", value: horse.color || "-" },
        { label: "Ngày sinh", value: formattedDob },
      ]
    : [];

  const metricDetails = horse
    ? [
        { label: "Tuổi", value: horse.age ?? "-" },
        { label: "Cân nặng (kg)", value: horse.weight ?? "-" },
        { label: "Chiều cao (cm)", value: horse.height ?? "-" },
      ]
    : [];

  const careerDetails = horse
    ? [
        { label: "Tổng số cuộc đua", value: horse.totalRaces ?? 0 },
        { label: "Tổng số trận thắng", value: horse.totalWins ?? 0 },
        { label: "Trạng thái duyệt", value: statusLabel },
      ]
    : [];

  return (
    <div className="owner-page owner-horse-detail">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Chủ Ngựa</p>
            <h3>Hồ sơ ngựa</h3>
            <p className="muted">Xem hiệu suất và trạng thái sức khỏe.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Trạng thái hiện tại</p>
            <h4>{statusLabel}</h4>
            <span>{horse?.name || "Đang tải ngựa"}</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Tỷ lệ thắng</p>
            <h4>{winRate}%</h4>
            <span>{horse?.totalWins ?? 0} trận thắng</span>
          </div>
        </aside>

        <div className="owner-content">
          {error ? <p className="form-error">{error}</p> : null}

          {isLoading || !horse ? (
            <p className="muted">Đang tải chi tiết ngựa...</p>
          ) : (
            <section className="horse-banner" aria-label={`${horse.name} chi tiết`}>
              <div className="horse-banner__media">
                {imageUrl ? (
                  <img src={imageUrl} alt={horse.name} />
                ) : (
                  <div className="horse-banner__placeholder" aria-hidden="true">
                    {horse.name?.slice(0, 1) || "H"}
                  </div>
                )}
              </div>
              <div className="horse-banner__content">
                <div className="horse-banner__header">
                  <span className={`horse-detail-status horse-detail-status--${statusLabel.toLowerCase()}`}>
                    {statusLabel}
                  </span>
                  <Link className="secondary-button" to={`/owner/horses/${horse.id}/edit`}>
                    Chỉnh sửa hồ sơ
                  </Link>
                </div>
                <span className="pill">Chi tiết ngựa</span>
                <h1>{horse.name}</h1>
                <p>
                  {horse.breed || "Không rõ giống"}
                  {horse.color ? ` • ${horse.color}` : ""}
                  {horse.gender ? ` • ${horse.gender}` : ""}
                </p>
                <div className="horse-banner__meta">
                  <div>
                    <span>Tuổi</span>
                    <strong>{horse.age ?? "-"} tuổi</strong>
                  </div>
                  <div>
                    <span>Cân nặng</span>
                    <strong>{horse.weight ?? "-"} kg</strong>
                  </div>
                  <div>
                    <span>Chiều cao</span>
                    <strong>{horse.height ?? "-"} cm</strong>
                  </div>
                  <div>
                    <span>Ngày sinh</span>
                    <strong>{formattedDob}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="stat-grid">
            <article className="stat-card">
              <span className="stat-card__label">01</span>
              <p className="muted">Tổng số trận thắng</p>
              <h3>{horse?.totalWins ?? 0}</h3>
              <span className="stat-trend">Tổng sự nghiệp</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">02</span>
              <p className="muted">Tổng số cuộc đua</p>
              <h3>{horse?.totalRaces ?? 0}</h3>
              <span className="stat-trend">Tổng sự nghiệp</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">03</span>
              <p className="muted">Tỷ lệ thắng</p>
              <h3>{winRate}%</h3>
              <span className="stat-trend">Hiệu suất đua</span>
            </article>
          </section>

          <section className="horse-detail-columns">
            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Hồ sơ ngựa</h2>
                <p>Thông tin cốt lõi từ sổ đăng ký ngựa.</p>
              </div>
              <div className="horse-info-list">
                {primaryDetails.map((item) => (
                  <article key={item.label} className="horse-info-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>

            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Chỉ số thể chất</h2>
                <p>Số đo mới nhất được ghi nhận.</p>
              </div>
              <div className="horse-info-list">
                {metricDetails.map((item) => (
                  <article key={item.label} className="horse-info-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Tổng sự nghiệp</h2>
                <p>Số trận thắng và cuộc đua của ngựa này.</p>
              </div>
              <div className="horse-info-list">
                {careerDetails.map((item) => (
                  <article key={item.label} className="horse-info-card">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseDetailPage;
