import { Link } from "react-router-dom";
import heroImage from "../../assets/racing.png";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <span className="pill">2026 Championship Season</span>
          <h1>Elite Horse Racing Tournament Platform</h1>
          <p>
            Welcome to the world’s premier horse racing management system with
            advanced analytics, live results, and season-wide standings.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/tournaments">
              View Tournaments
            </Link>
            <Link className="ghost-button" to="/live-results">
              Live Results
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <div className="hero-image">
            <img src={heroImage} alt="Champion horses racing" />
          </div>
          <div className="hero-panel">
            <h3>Next Championship Race</h3>
            <div className="countdown-grid">
              <div>
                <strong>33</strong>
                <span>Days</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Hours</span>
              </div>
              <div>
                <strong>33</strong>
                <span>Minutes</span>
              </div>
              <div>
                <strong>26</strong>
                <span>Seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="section-heading">
          <h2>Featured Upcoming Tournament</h2>
          <p>Don’t miss the championship finale at Churchill Downs.</p>
        </div>
        <div className="featured-card">
          <div>
            <span className="badge">Featured</span>
            <h3>Spring Championship Finals</h3>
            <p className="muted">June 15, 2026 · Churchill Downs</p>
            <div className="stats-row">
              <div>
                <strong>12</strong>
                <span>Entries</span>
              </div>
              <div>
                <strong>1.5 mi</strong>
                <span>Distance</span>
              </div>
              <div>
                <strong>2:00 PM</strong>
                <span>Start Time</span>
              </div>
              <div>
                <strong>Open</strong>
                <span>Status</span>
              </div>
            </div>
          </div>
          <div className="featured-highlight">
            <span>$500K</span>
            <p>Prize Pool</p>
            <Link className="primary-button" to="/schedule">
              View Full Schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="two-column">
        <div>
          <h2>Top Horses</h2>
          <p className="muted">Featured champions across the circuit.</p>
          <div className="rank-list">
            <div className="rank-card">
              <span className="rank">#1</span>
              <div>
                <h4>Thunder Strike</h4>
                <p>12 wins</p>
              </div>
              <strong>98</strong>
            </div>
            <div className="rank-card">
              <span className="rank">#2</span>
              <div>
                <h4>Golden Dawn</h4>
                <p>10 wins</p>
              </div>
              <strong>96</strong>
            </div>
            <div className="rank-card">
              <span className="rank">#3</span>
              <div>
                <h4>Midnight Runner</h4>
                <p>15 wins</p>
              </div>
              <strong>99</strong>
            </div>
          </div>
        </div>
        <div>
          <h2>Top Jockeys</h2>
          <p className="muted">Elite riders by win percentage.</p>
          <div className="rank-list">
            <div className="rank-card">
              <span className="rank">#1</span>
              <div>
                <h4>Marcus Rodriguez</h4>
                <p>45 wins</p>
              </div>
              <strong>68%</strong>
            </div>
            <div className="rank-card">
              <span className="rank">#2</span>
              <div>
                <h4>Sarah Chen</h4>
                <p>38 wins</p>
              </div>
              <strong>65%</strong>
            </div>
            <div className="rank-card">
              <span className="rank">#3</span>
              <div>
                <h4>James O'Connor</h4>
                <p>52 wins</p>
              </div>
              <strong>71%</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
