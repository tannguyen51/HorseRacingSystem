import { useState, useEffect } from "react";
import "../RefereeSharedLayout.css";
import "./RefereeDashboardPage.css";

const stats = [
  { label: "Pending assignments", value: "3", trend: "2 this week" },
  { label: "Accepted assignments", value: "5", trend: "+1 today" },
  { label: "Completed duties", value: "12", trend: "+2 this month" },
  { label: "Accuracy rating", value: "98%", trend: "Excellent" },
];

const upcomingAssignments = [
  {
    title: "Spring Championship Finals",
    time: "May 24 · 4:20 PM",
    track: "Churchill Downs",
    type: "Final Round",
  },
  {
    title: "Coastal Derby Qualifier",
    time: "May 22 · 2:40 PM",
    track: "Gulfstream Park",
    type: "Qualifying Heat",
  },
  {
    title: "Golden Mile Invitational",
    time: "May 28 · 5:10 PM",
    track: "Santa Anita",
    type: "Main Race",
  },
];

const recentActivity = [
  {
    title: "Assignment accepted",
    detail: "Coastal Derby Qualifier - May 22 at 2:40 PM",
    time: "2 hours ago",
  },
  {
    title: "Match report submitted",
    detail: "Spring Showcase - Thunder Strike placed 2nd",
    time: "Yesterday",
  },
  {
    title: "New assignment pending",
    detail: "Golden Mile Invitational - waiting for response",
    time: "May 16",
  },
];

const tournamentSchedule = [
  {
    name: "Spring Championship Finals",
    races: "12 matches",
    status: "Live",
    dates: "May 20-26",
  },
  {
    name: "Pacific Classic Series",
    races: "9 matches",
    status: "Upcoming",
    dates: "June 10-15",
  },
];

function RefereeDashboardPage() {
  const [assignmentStats, setAssignmentStats] = useState({
    pending: 3,
    accepted: 5,
    completed: 12,
    rating: "98%",
  });

  useEffect(() => {
    // In a real app, fetch referee stats from API
    setAssignmentStats({
      pending: 3,
      accepted: 5,
      completed: 12,
      rating: "98%",
    });
  }, []);

  return (
    <div className="referee-page">
      <div className="referee-layout">
        <aside className="referee-sidebar">
          <div className="referee-sidebar__header">
            <p className="pill">Referee</p>
            <h3>Match Official</h3>
            <p className="muted">Manage assignments and duties.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Pending response</p>
            <h4>Golden Mile Invitational</h4>
            <span>Due today</span>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Accuracy rating</p>
            <h4>{assignmentStats.rating}</h4>
            <span>Excellent performance</span>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Referee dashboard</span>
              <h1>Welcome back, Official</h1>
              <p>
                Manage your match assignments, review tournament schedules, and 
                maintain the highest standards of integrity across all races.
              </p>
              <div className="referee-hero__actions">
                <button className="primary-button">View assignments</button>
                <button className="ghost-button">Tournament calendar</button>
              </div>
            </div>
            <div className="referee-hero__panel">
              <span>Total Matches Officiated</span>
              <strong>47</strong>
            </div>
          </section>

          <section className="referee-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <h3>{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
                <span className="stat-trend">{stat.trend}</span>
              </div>
            ))}
          </section>

          <div className="referee-columns">
            <div className="referee-stack">
              <section className="referee-section">
                <h2>Upcoming Assignments</h2>
                <div className="referee-card-grid">
                  {upcomingAssignments.map((race, i) => (
                    <div key={i} className="referee-card hover-lift">
                      <span className="badge">{race.type}</span>
                      <h3>{race.title}</h3>
                      <p className="muted">{race.track}</p>
                      <p className="time">{race.time}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="referee-stack">
              <section className="referee-section">
                <h2>Recent Activity</h2>
                <div className="activity-feed">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="activity-item">
                      <h4>{item.title}</h4>
                      <p className="muted">{item.detail}</p>
                      <span className="time">{item.time}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <section className="referee-section">
            <h2>Tournament Schedule</h2>
            <div className="tournament-grid">
              {tournamentSchedule.map((tournament, i) => (
                <div key={i} className="tournament-card hover-lift">
                  <div className="card-header">
                    <h3>{tournament.name}</h3>
                    <span className={`status status--${tournament.status.toLowerCase()}`}>
                      {tournament.status}
                    </span>
                  </div>
                  <p className="muted">{tournament.races}</p>
                  <p className="time">{tournament.dates}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RefereeDashboardPage;
