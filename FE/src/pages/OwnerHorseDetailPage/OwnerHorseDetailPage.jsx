import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMyHorses } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "./OwnerHorseDetailPage.css";

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
        const data = await getMyHorses();
        const list = Array.isArray(data) ? data : [];
        const match = list.find((item) => item.id === id);
        if (isMounted) {
          setHorse(match || null);
          if (!match) {
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
            <span>Last updated today</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Assigned jockey</p>
            <h4>Unassigned</h4>
            <span>Pending</span>
          </div>
        </aside>

        <div className="owner-content">
          {error ? <p className="form-error">{error}</p> : null}

          {isLoading || !horse ? (
            <p className="muted">Loading horse details...</p>
          ) : (
            <section className="horse-banner">
              <div
                className="horse-banner__image"
                style={
                  horse.imageUrl
                    ? { backgroundImage: `url(${horse.imageUrl})` }
                    : undefined
                }
                aria-hidden="true"
              />
              <div className="horse-banner__content">
                <span className="pill">Horse detail</span>
                <h1>{horse.name}</h1>
                <p>{horse.breed || "Unknown breed"}</p>
                <div className="horse-banner__meta">
                  <div>
                    <span>Age</span>
                    <strong>{horse.age ?? "-"}</strong>
                  </div>
                  <div>
                    <span>Weight</span>
                    <strong>{horse.weight ?? "-"}</strong>
                  </div>
                  <div>
                    <span>Height</span>
                    <strong>{horse.height ?? "-"}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="stat-grid">
            <article className="stat-card">
              <p className="muted">Total wins</p>
              <h3>{horse?.totalWins ?? 0}</h3>
              <span className="stat-trend">Career total</span>
            </article>
            <article className="stat-card">
              <p className="muted">Total races</p>
              <h3>{horse?.totalRaces ?? 0}</h3>
              <span className="stat-trend">Career total</span>
            </article>
            <article className="stat-card">
              <p className="muted">Approval status</p>
              <h3>{statusLabel}</h3>
              <span className="stat-trend">Current status</span>
            </article>
          </section>

          <section className="horse-detail-columns">
            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Horse profile</h2>
                <p>Core profile details from the registry.</p>
              </div>
              <div className="participation-list">
                {primaryDetails.map((item) => (
                  <article key={item.label} className="participation-card">
                    <div>
                      <h4>{item.label}</h4>
                      <p className="muted">{item.value}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Physical metrics</h2>
                <p>Latest recorded measurements.</p>
              </div>
              <div className="participation-list">
                {metricDetails.map((item) => (
                  <article key={item.label} className="participation-card">
                    <div>
                      <h4>{item.label}</h4>
                      <p className="muted">{item.value}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="section-heading">
                <h2>Career totals</h2>
                <p>Wins and races for this horse.</p>
              </div>
              <div className="participation-list">
                {careerDetails.map((item) => (
                  <article key={item.label} className="participation-card">
                    <div>
                      <h4>{item.label}</h4>
                      <p className="muted">{item.value}</p>
                    </div>
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
