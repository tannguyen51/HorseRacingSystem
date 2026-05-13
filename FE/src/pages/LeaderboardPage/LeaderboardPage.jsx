import "./LeaderboardPage.css";

const rows = [
  {
    rank: 1,
    horse: "Midnight Runner",
    owner: "Royal Stables",
    rating: 99,
    wins: 15,
    earnings: "$1.5M",
    change: "+1",
  },
  {
    rank: 2,
    horse: "Thunder Strike",
    owner: "Elite Stables",
    rating: 98,
    wins: 12,
    earnings: "$1.2M",
    change: "-1",
  },
  {
    rank: 3,
    horse: "Golden Dawn",
    owner: "Victory Ranch",
    rating: 96,
    wins: 10,
    earnings: "$980K",
    change: "0",
  },
  {
    rank: 4,
    horse: "Storm Chaser",
    owner: "Thunder Bay",
    rating: 95,
    wins: 11,
    earnings: "$890K",
    change: "+1",
  },
];

function LeaderboardPage() {
  return (
    <div className="leaderboard-page">
      <section className="page-header">
        <h1>Leaderboard</h1>
        <p>Championship standings and rankings.</p>
      </section>

      <div className="leaderboard-table">
        <div className="table-row table-header">
          <span>Rank</span>
          <span>Horse</span>
          <span>Owner</span>
          <span>Rating</span>
          <span>Wins</span>
          <span>Earnings</span>
          <span>Change</span>
        </div>
        {rows.map((row) => (
          <div key={row.rank} className="table-row">
            <span className="rank-pill">{row.rank}</span>
            <span>{row.horse}</span>
            <span className="muted">{row.owner}</span>
            <span className="rating">{row.rating}</span>
            <span>{row.wins}</span>
            <span className="earnings">{row.earnings}</span>
            <span className={row.change.startsWith("-") ? "down" : "up"}>
              {row.change === "0" ? "-" : row.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardPage;
