import { Link, NavLink } from "react-router-dom";
import "./SpectatorHeader.css";

const navItems = [
  { to: "/spectator", label: "Dashboard", end: true },
  { to: "/spectator/tournaments", label: "Tournaments" },
];

function SpectatorHeader() {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  };

  return (
    <header className="spectator-header">
      <Link className="spectator-header__brand" to="/spectator">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Spectator Hub</p>
        </div>
      </Link>

      <nav className="spectator-header__nav" aria-label="Spectator">
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

      <div className="spectator-header__actions">
        <Link className="ghost-button" to="/" onClick={handleLogout}>
          Logout
        </Link>
      </div>
    </header>
  );
}

export default SpectatorHeader;
