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
      1: "Pending",
      2: "Approved",
      3: "Rejected",
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
            setError("Horse not found.");
          }
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || "Unable to load horse details.");
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
    ? (approvalStatusMap[horse.approvalStatus] ?? "Pending")
    : "Pending";

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
        { label: "Breed", value: horse.breed || "-" },
        { label: "Gender", value: horse.gender || "-" },
        { label: "Color", value: horse.color || "-" },
        { label: "Date of birth", value: formattedDob },
      ]
    : [];

  const metricDetails = horse
    ? [
        { label: "Age", value: horse.age ?? "-" },
        { label: "Weight (kg)", value: horse.weight ?? "-" },
        { label: "Height (cm)", value: horse.height ?? "-" },
      ]
    : [];

  const careerDetails = horse
    ? [
        { label: "Total races", value: horse.totalRaces ?? 0 },
        { label: "Total wins", value: horse.totalWins ?? 0 },
        { label: "Approval status", value: statusLabel },
      ]
    : [];

  return (
    <div className="owner-page owner-horse-detail">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Horse profile</h3>
            <p className="muted">Review performance and medical status.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Current status</p>
            <h4>{statusLabel}</h4>
            <span>{horse?.name || "Loading horse"}</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Win rate</p>
            <h4>{winRate}%</h4>
            <span>{horse?.totalWins ?? 0} wins</span>
          </div>
        </aside>

        <div className="owner-content">
          {error ? <p className="form-error">{error}</p> : null}

          {isLoading || !horse ? (
            <p className="muted">Loading horse details...</p>
          ) : (
            <section className="horse-banner" aria-label={`${horse.name} detail`}>
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
                    Edit profile
                  </Link>
                </div>
                <span className="pill">Horse detail</span>
                <h1>{horse.name}</h1>
                <p>
                  {horse.breed || "Unknown breed"}
                  {horse.color ? ` • ${horse.color}` : ""}
                  {horse.gender ? ` • ${horse.gender}` : ""}
                </p>
                <div className="horse-banner__meta">
                  <div>
                    <span>Age</span>
                    <strong>{horse.age ?? "-"} years</strong>
                  </div>
                  <div>
                    <span>Weight</span>
                    <strong>{horse.weight ?? "-"} kg</strong>
                  </div>
                  <div>
                    <span>Height</span>
                    <strong>{horse.height ?? "-"} cm</strong>
                  </div>
                  <div>
                    <span>Born</span>
                    <strong>{formattedDob}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="stat-grid">
            <article className="stat-card">
              <span className="stat-card__label">01</span>
              <p className="muted">Total wins</p>
              <h3>{horse?.totalWins ?? 0}</h3>
              <span className="stat-trend">Career total</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">02</span>
              <p className="muted">Total races</p>
              <h3>{horse?.totalRaces ?? 0}</h3>
              <span className="stat-trend">Career total</span>
            </article>
            <article className="stat-card">
              <span className="stat-card__label">03</span>
              <p className="muted">Win rate</p>
              <h3>{winRate}%</h3>
              <span className="stat-trend">Race performance</span>
            </article>
          </section>

          <section className="horse-detail-columns">
            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Horse profile</h2>
                <p>Core profile details from the horse registry.</p>
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
                <h2>Physical metrics</h2>
                <p>Latest recorded measurements.</p>
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
                <h2>Career totals</h2>
                <p>Wins and races for this horse.</p>
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
