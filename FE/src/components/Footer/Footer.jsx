import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div>
          <h3>RaceMaster</h3>
          <p>
            Premier platform for elite horse racing tournaments, connecting
            owners, jockeys, and spectators worldwide.
          </p>
          <div className="footer-badges">
            <span>Since 2026</span>
            <span>Global Series</span>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>Tournaments</li>
            <li>Leaderboard</li>
            <li>Live Results</li>
          </ul>
        </div>
        <div>
          <h4>For Users</h4>
          <ul>
            <li>Horse Owners</li>
            <li>Jockeys</li>
            <li>Officials</li>
            <li>Rules &amp; Guidelines</li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>contact@racemaster.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Racing Boulevard</li>
            <li>Louisville, KY 40208</li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© 2026 RaceMaster Tournament Platform</span>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
