import "../SpectatorSharedLayout.css";
import "./SpectatorPredictionResultPage.css";

const predictions = [
  {
    id: 1,
    race: "Bluegrass Sprint",
    tournament: "Spring Championship Finals",
    pick: "Thunder Strike",
    result: "Correct",
    reward: "+420",
    time: "Today · 2:40 PM",
  },
  {
    id: 2,
    race: "Coastal Derby",
    tournament: "Spring Championship Finals",
    pick: "Silver Comet",
    result: "Incorrect",
    reward: "+0",
    time: "Today · 1:20 PM",
  },
  {
    id: 3,
    race: "Emerald Invitational",
    tournament: "Pacific Classic Series",
    pick: "Harbor Blaze",
    result: "Correct",
    reward: "+310",
    time: "May 16 · 3:20 PM",
  },
  {
    id: 4,
    race: "Capital Cup",
    tournament: "Bluegrass Invitational",
    pick: "Golden Dawn",
    result: "Correct",
    reward: "+280",
    time: "May 15 · 2:10 PM",
  },
];

const rewardHistory = [
  {
    id: 1,
    title: "Spring Finals Bonus",
    detail: "3 correct picks in a row",
    points: "+200",
    date: "Today · 3:05 PM",
  },
  {
    id: 2,
    title: "Daily Accuracy",
    detail: "70% accuracy milestone",
    points: "+150",
    date: "Today · 11:45 AM",
  },
  {
    id: 3,
    title: "Leaderboard Boost",
    detail: "Top 10 predictor",
    points: "+120",
    date: "May 16 · 6:20 PM",
  },
];

function SpectatorPredictionResultPage() {
  const isLoading = false;
  const totalPredictions = predictions.length;
  const correctPredictions = predictions.filter(
    (prediction) => prediction.result === "Correct",
  ).length;
  const accuracyPercent =
    totalPredictions > 0
      ? Math.round((correctPredictions / totalPredictions) * 100)
      : 0;
  const totalRewards = predictions.reduce((sum, prediction) => {
    return sum + Number(prediction.reward.replace("+", ""));
  }, 0);

  const stats = [
    { label: "Total predictions", value: totalPredictions },
    { label: "Correct picks", value: correctPredictions },
    { label: "Rewards earned", value: `${totalRewards} pts` },
  ];

  return (
    <div className="spectator-page spectator-prediction-result-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Prediction Results</h3>
            <p className="muted">Track accuracy and rewards.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Accuracy rate</p>
            <h4>{accuracyPercent}%</h4>
            <span>Last 10 races</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Prediction Results</h1>
            <p>Review history, rewards, and overall accuracy.</p>
          </section>

          <section className="prediction-stats">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card hover-lift">
                <p className="muted">{stat.label}</p>
                <h3>{stat.value}</h3>
                <span className="stat-detail">Updated moments ago</span>
              </article>
            ))}
          </section>

          <section className="accuracy-panel">
            <div>
              <h2>Accuracy progress</h2>
              <p className="muted">
                You are {accuracyPercent}% accurate across recent races.
              </p>
            </div>
            <div className="accuracy-bar">
              <div
                className="accuracy-bar__fill"
                style={{ width: `${accuracyPercent}%` }}
              />
            </div>
          </section>

          <section className="prediction-columns">
            <div className="spectator-section">
              <div className="section-heading">
                <h2>Prediction history</h2>
                <p>Every pick and its outcome.</p>
              </div>
              {predictions.length === 0 ? (
                <div className="empty-state">
                  <h4>No predictions submitted</h4>
                  <p>Start with a live race to build your history.</p>
                </div>
              ) : (
                <div className="prediction-table">
                  <div className="table-row table-header">
                    <span>Race</span>
                    <span>Tournament</span>
                    <span>Pick</span>
                    <span>Status</span>
                    <span>Reward</span>
                  </div>
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="table-row">
                      <div>
                        <strong>{prediction.race}</strong>
                        <p className="muted">{prediction.time}</p>
                      </div>
                      <span className="muted">{prediction.tournament}</span>
                      <span>{prediction.pick}</span>
                      <span
                        className={`prediction-badge ${
                          prediction.result === "Correct"
                            ? "prediction-badge--success"
                            : "prediction-badge--fail"
                        }`}
                      >
                        {prediction.result}
                      </span>
                      <span className="earnings">{prediction.reward}</span>
                    </div>
                  ))}
                  {isLoading ? (
                    <div className="table-row skeleton-card">
                      <div className="skeleton-line" />
                      <div className="skeleton-line wide" />
                      <div className="skeleton-line" />
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="spectator-section">
              <div className="section-heading">
                <h2>Reward history</h2>
                <p>Recent bonuses and streak rewards.</p>
              </div>
              <div className="reward-list">
                {rewardHistory.map((reward) => (
                  <article key={reward.id} className="prediction-reward-card">
                    <div>
                      <h4>{reward.title}</h4>
                      <p className="muted">{reward.detail}</p>
                    </div>
                    <div className="prediction-reward-meta">
                      <span>{reward.date}</span>
                      <strong>{reward.points} pts</strong>
                    </div>
                  </article>
                ))}
                {isLoading ? (
                  <article className="prediction-reward-card skeleton-card">
                    <div className="skeleton-line" />
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line" />
                  </article>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SpectatorPredictionResultPage;
