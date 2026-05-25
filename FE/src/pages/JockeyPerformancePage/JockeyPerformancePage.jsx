import React from 'react';
import "../SpectatorSharedLayout.css";


const achievementHistory = [
  { id: 1, raceName: "Kentucky Derby", track: "Churchill Downs", date: "May 02, 2026", horseName: "Thunder Bolt", position: 1, earnings: "$90,000" },
  { id: 2, raceName: "Preakness Stakes", track: "Pimlico", date: "May 16, 2026", horseName: "Wind Runner", position: 3, earnings: "$25,000" },
  { id: 3, raceName: "Belmont Stakes", track: "Belmont Park", date: "June 06, 2025", horseName: "Thunder Bolt", position: 2, earnings: "$45,000" },
  { id: 4, raceName: "Breeders' Cup Classic", track: "Santa Anita", date: "Nov 01, 2025", horseName: "Storm Chaser", position: 1, earnings: "$120,000" },
];

export function JockeyPerformancePage() {
  
  const totalRaces = achievementHistory.length;
  const winRaces = achievementHistory.filter(item => item.position === 1).length;
  const winRate = totalRaces > 0 ? ((winRaces / totalRaces) * 100).toFixed(0) + "%" : "0%";
  
  const totalEarnings = achievementHistory.reduce((sum, item) => {
    const value = parseInt(item.earnings.replace(/[^0-9]/g, ''), 10);
    return sum + value;
  }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="spectator-page jockey-performance">
      <div className="spectator-layout">
        
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Jockey Performance</p>
            <h3>Rider Analytics</h3>
            <p className="muted">Your official career record.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Current Standing</p>
            <h4>Rank #4 Elite Rider</h4>
            <span>Top 5% League Status</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="spectator-stats">
            <article className="stat-card hover-lift">
              <p className="muted">Total Career Races</p>
              <h3>{totalRaces}</h3>
              <span className="stat-trend">Stable</span>
            </article>
            <article className="stat-card hover-lift">
              <p className="muted">Win Rate (1st Place)</p>
              <h3>{winRate}</h3>
              <span className="stat-trend">+4% this season</span>
            </article>
            <article className="stat-card hover-lift">
              <p className="muted">Total Earnings</p>
              <h3>{totalEarnings}</h3>
              <span className="stat-trend">Gross Stakes</span>
            </article>
          </section>

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Achievement History</h2>
              <p>Verified historical race placements and official breakdown.</p>
            </div>
            
            <table className="leaderboard-table">
              <thead>
                <tr className="table-row table-header">
                  <th scope="col">Date</th>
                  <th scope="col">Race / Track</th>
                  <th scope="col">Mount (Horse)</th>
                  <th scope="col">Position</th>
                  <th scope="col">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {achievementHistory.map((row) => (
                  <tr key={row.id} className="table-row">
                    <td className="muted">{row.date}</td>
                    <td>
                      <strong>{row.raceName}</strong>
                      <div className="muted" style={{ fontSize: '0.8rem' }}>{row.track}</div>
                    </td>
                    <td>🐎 {row.horseName}</td>
                    <td className={`rank-pill position-${row.position}`}>
                      {row.position === 1 ? "🥇 1st" : row.position === 2 ? "🥈 2nd" : row.position === 3 ? "🥉 3rd" : `${row.position}th`}
                    </td>
                    <td className="earnings" style={{ color: row.position === 1 ? '#166534' : 'inherit' }}>
                      {row.earnings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

      </div>
    </div>
  );
}

export default JockeyPerformancePage;