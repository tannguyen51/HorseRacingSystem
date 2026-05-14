import { Link, NavLink } from "react-router-dom";
import "./Header.css";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/tournaments", label: "Tournament List" },
  { to: "/schedule", label: "Race Schedule" },
  { to: "/live-results", label: "Live Results" },
  { to: "/leaderboard", label: "Leaderboard" },
];

function Header() {
  return (
    <header className="site-header">
      <Link className="site-header__brand" to="/">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Tournament Platform</p>
        </div>
      </Link>

      <nav className="site-header__nav" aria-label="Primary">
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

export default Header;
