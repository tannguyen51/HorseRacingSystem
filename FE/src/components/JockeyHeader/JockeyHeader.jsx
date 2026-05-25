import { Link, NavLink } from "react-router-dom";
import "../Header/Header.css";

const navItems = [
  { to: "/jockey/invitations", label: "Invitations", end: true },
  { to: "/jockey/schedule", label: "Schedule" },
  { to: "/jockey/performance", label: "Performance" },
];

function JockeyHeader() {
  return (
    <header className="site-header">
      <Link className="site-header__brand" to="/jockey/invitations">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Jockey Portal</p>
        </div>
      </Link>

      <nav className="site-header__nav" aria-label="Jockey">
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

export default JockeyHeader;
