import { Link, NavLink } from "react-router-dom";
import "../Header/Header.css";

const navItems = [
  { to: "/spectator", label: "Dashboard", end: true },
  { to: "/spectator/tournaments", label: "Tournaments" },
  { to: "/spectator/schedule", label: "Race Schedule" },
  { to: "/spectator/live-ranking", label: "Live Rankings" },
  { to: "/spectator/predictions", label: "Predictions" },
  { to: "/spectator/rewards", label: "Rewards" },
];

function SpectatorHeader() {
  return (
    <header className="site-header">
      <Link className="site-header__brand" to="/spectator">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Spectator Hub</p>
        </div>
      </Link>

      <nav className="site-header__nav" aria-label="Spectator">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? "nav-link nav-link--active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="site-header__actions">
        <Link className="ghost-button" to="/login">
          Login
        </Link>
        <Link className="primary-button" to="/register">
          Register
        </Link>
      </div>
    </header>
  );
}

export default SpectatorHeader;
