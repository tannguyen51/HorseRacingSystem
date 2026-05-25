import { useParams } from "react-router-dom";
import "../OwnerSharedLayout.css";
import "./OwnerHorseDetailPage.css";

const horseData = {
  1: {
    name: "Thunder Strike",
    breed: "Thoroughbred",
    age: 4,
    speed: 94,
    status: "Active",
    weight: "480 kg",
    jockey: "Ariana Blake",
  },
  2: {
    name: "Silver Comet",
    breed: "Arabian",
    age: 5,
    speed: 91,
    status: "Active",
    weight: "465 kg",
    jockey: "Drew Hamilton",
  },
};

const raceHistory = [
  {
    id: 1,
    race: "Spring Showcase",
    date: "May 12, 2026",
    result: "2nd",
    time: "1:36.4",
    prize: "$12,000",
  },
  {
    id: 2,
    race: "Emerald Stakes",
    date: "Apr 28, 2026",
    result: "1st",
    time: "1:35.1",
    prize: "$25,000",
  },
  {
    id: 3,
    race: "Winter Cup",
    date: "Apr 10, 2026",
    result: "3rd",
    time: "1:37.8",
    prize: "$8,500",
  },
];

const participationHistory = [
  {
    id: 1,
    tournament: "Spring Championship Finals",
    status: "Qualified",
    races: 3,
  },
  {
    id: 2,
    tournament: "Pacific Classic Series",
    status: "Registered",
    races: 2,
  },
];

const performanceChart = [
  { label: "Speed", value: 94 },
  { label: "Stamina", value: 86 },
  { label: "Start", value: 88 },
  { label: "Finish", value: 90 },
];

function OwnerHorseDetailPage() {
  const { id } = useParams();
  const horse = horseData[id] ?? horseData["1"];

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
            <h4>{horse.status}</h4>
            <span>Last updated today</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Assigned jockey</p>
            <h4>{horse.jockey}</h4>
            <span>Confirmed</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="horse-banner">
            <div className="horse-banner__image" aria-hidden="true" />
            <div className="horse-banner__content">
              <span className="pill">Horse detail</span>
              <h1>{horse.name}</h1>
              <p>{horse.breed}</p>
              <div className="horse-banner__meta">
                <div>
                  <span>Age</span>
                  <strong>{horse.age}</strong>
                </div>
                <div>
                  <span>Weight</span>
                  <strong>{horse.weight}</strong>
                </div>
                <div>
                  <span>Speed rating</span>
                  <strong>{horse.speed}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="stat-grid">
            <article className="stat-card">
              <p className="muted">Season wins</p>
              <h3>4</h3>
              <span className="stat-trend">+1 this month</span>
            </article>
            <article className="stat-card">
              <p className="muted">Best time</p>
              <h3>1:35.1</h3>
              <span className="stat-trend">Emerald Stakes</span>
            </article>
            <article className="stat-card">
              <p className="muted">Top 3 finishes</p>
              <h3>6</h3>
              <span className="stat-trend">Season total</span>
            </article>
          </section>

          <section className="horse-detail-columns">
            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Race history</h2>
                <p>Recent results and prize earnings.</p>
              </div>
              <div className="history-table">
                <div className="table-row table-header">
                  <span>Race</span>
                  <span>Date</span>
                  <span>Result</span>
                  <span>Time</span>
                  <span>Prize</span>
                </div>
                {raceHistory.map((race) => (
                  <div key={race.id} className="table-row">
                    <span>{race.race}</span>
                    <span>{race.date}</span>
                    <span className="highlight">{race.result}</span>
                    <span>{race.time}</span>
                    <span className="highlight">{race.prize}</span>
                  </div>
                ))}
              </div>

              <div className="section-heading">
                <h2>Tournament participation</h2>
                <p>Events where this horse is currently listed.</p>
              </div>
              <div className="participation-list">
                {participationHistory.map((item) => (
                  <article key={item.id} className="participation-card">
                    <div>
                      <h4>{item.tournament}</h4>
                      <p className="muted">{item.races} races</p>
                    </div>
                    <span className="badge">{item.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="horse-detail-stack">
              <div className="section-heading">
                <h2>Performance chart</h2>
                <p>Latest speed and stamina check.</p>
              </div>
              <div className="performance-card">
                {performanceChart.map((item) => (
                  <div key={item.label} className="chart-row">
                    <span>{item.label}</span>
                    <div className="chart-track">
                      <div
                        className="chart-fill"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="section-heading">
                <h2>Assigned jockey</h2>
                <p>Primary rider information.</p>
              </div>
              <article className="jockey-card">
                <div className="jockey-avatar">AB</div>
                <div>
                  <h4>{horse.jockey}</h4>
                  <p className="muted">Senior jockey</p>
                </div>
                <button className="ghost-button">Message</button>
              </article>

              <div className="section-heading">
                <h2>Medical status</h2>
                <p>Health checks and care notes.</p>
              </div>
              <article className="medical-card">
                <div>
                  <h4>Condition</h4>
                  <p className="muted">Cleared for race entry</p>
                </div>
                <div>
                  <h4>Next check</h4>
                  <p className="muted">May 20, 2026</p>
                </div>
                <div>
                  <h4>Notes</h4>
                  <p className="muted">Hydration plan updated</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerHorseDetailPage;
