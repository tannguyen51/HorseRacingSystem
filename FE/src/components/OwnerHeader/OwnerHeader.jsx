import { Link, NavLink } from "react-router-dom";
import "../Header/Header.css";

const navItems = [
  { to: "/owner", label: "Dashboard", end: true },
  { to: "/owner/horses", label: "Horses" },
  { to: "/owner/tournaments", label: "Tournaments" },
  { to: "/owner/race-confirmation", label: "Race Confirmations" },
];

function OwnerHeader() {
  return (
    <header className="site-header">
      <Link className="site-header__brand" to="/owner">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Owner Console</p>
        </div>
      </Link>

      <nav className="site-header__nav" aria-label="Owner">
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

export default OwnerHeader;
