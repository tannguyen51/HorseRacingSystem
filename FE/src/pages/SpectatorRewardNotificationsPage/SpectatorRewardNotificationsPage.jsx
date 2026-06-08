import { useState } from "react";
import "../SpectatorSharedLayout.css";
import "./SpectatorRewardNotificationsPage.css";

const notifications = [
  {
    id: 1,
    title: "Spring Finals Bonus",
    detail: "3 correct picks in a row",
    points: 200,
    status: "Unclaimed",
    date: "Today · 3:20 PM",
    type: "streak",
  },
  {
    id: 2,
    title: "Top 10 Predictor",
    detail: "Leaderboard milestone",
    points: 150,
    status: "Unclaimed",
    date: "Today · 1:05 PM",
    type: "trophy",
  },
  {
    id: 3,
    title: "Daily Accuracy",
    detail: "70% accuracy achieved",
    points: 120,
    status: "Claimed",
    date: "May 16 · 6:20 PM",
    type: "coins",
  },
];

const rewardHistory = [
  {
    id: 1,
    title: "Weekly Streak",
    detail: "5 straight wins",
    points: "+300",
    date: "May 15 · 4:10 PM",
  },
  {
    id: 2,
    title: "Tournament Bonus",
    detail: "Spring Finals bonus",
    points: "+250",
    date: "May 12 · 2:05 PM",
  },
];

const summaryStats = [
  { label: "Unclaimed", value: "350 pts" },
  { label: "Claimed", value: "820 pts" },
  { label: "Total rewards", value: "1,170 pts" },
];

function SpectatorRewardNotificationsPage() {
  const [activeReward, setActiveReward] = useState(null);
  const isLoading = false;

  return (
    <div className="spectator-page spectator-reward-page">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Spectator</p>
            <h3>Rewards Center</h3>
            <p className="muted">Claim bonuses and track points.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Reward balance</p>
            <h4>1,170 pts</h4>
            <span>Updated moments ago</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="page-header">
            <h1>Reward Notifications</h1>
            <p>New rewards, claim history, and reward points.</p>
          </section>

          <section className="reward-stats">
            {summaryStats.map((stat) => (
              <article key={stat.label} className="stat-card hover-lift">
                <p className="muted">{stat.label}</p>
                <h3>{stat.value}</h3>
                <span className="stat-detail">Updated just now</span>
              </article>
            ))}
          </section>

          <section className="reward-columns">
            <div className="spectator-section">
              <div className="section-heading">
                <h2>Reward notifications</h2>
                <p>Claim pending rewards before they expire.</p>
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <h4>No rewards yet</h4>
                  <p>Keep predicting to unlock new bonuses.</p>
                </div>
              ) : (
                <div className="notification-grid">
                  {notifications.map((notification) => (
                    <article
                      key={notification.id}
                      className={`notification-card ${
                        notification.status === "Claimed"
                          ? "notification-card--claimed"
                          : ""
                      }`}
                    >
                      <div
                        className={`reward-icon reward-icon--${notification.type}`}
                      >
                        <span>RP</span>
                      </div>
                      <div>
                        <h4>{notification.title}</h4>
                        <p className="muted">{notification.detail}</p>
                        <span className="reward-date">{notification.date}</span>
                      </div>
                      <div className="reward-actions">
                        <strong>{notification.points} pts</strong>
                        <button
                          className="primary-button"
                          type="button"
                          disabled={notification.status === "Claimed"}
                          onClick={() => setActiveReward(notification)}
                        >
                          {notification.status === "Claimed"
                            ? "Claimed"
                            : "Claim reward"}
                        </button>
                      </div>
                    </article>
                  ))}
                  {isLoading ? (
                    <article className="notification-card skeleton-card">
                      <div className="skeleton-line" />
                      <div className="skeleton-line wide" />
                      <div className="skeleton-line" />
                    </article>
                  ) : null}
                </div>
              )}
            </div>

            <div className="spectator-section">
              <div className="section-heading">
                <h2>Reward history</h2>
                <p>Recent claimed rewards and bonuses.</p>
              </div>
              <div className="reward-history">
                {rewardHistory.map((reward) => (
                  <article key={reward.id} className="reward-history-card">
                    <div>
                      <h4>{reward.title}</h4>
                      <p className="muted">{reward.detail}</p>
                    </div>
                    <div className="reward-meta">
                      <span>{reward.date}</span>
                      <strong>{reward.points}</strong>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {activeReward ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reward-modal-title"
        >
          <div className="spectator-modal">
            <div className="modal-header">
              <div>
                <span className="badge">Reward ready</span>
                <h3 id="reward-modal-title">Claim reward</h3>
                <p className="muted">Confirm to add points to your balance.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setActiveReward(null)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Reward</h4>
                <p>{activeReward.title}</p>
              </div>
              <div>
                <h4>Points</h4>
                <p>{activeReward.points} pts</p>
              </div>
              <div>
                <h4>Status</h4>
                <p>{activeReward.status}</p>
              </div>
              <div>
                <h4>Issued</h4>
                <p>{activeReward.date}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="primary-button">Claim now</button>
              <button
                className="ghost-button"
                onClick={() => setActiveReward(null)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SpectatorRewardNotificationsPage;
