import { Link, NavLink, useNavigate } from "react-router-dom";
import { spectatorNavItems } from "../../constants/spectatorNavigation";
import "./SpectatorHeader.css";

function SpectatorHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
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
        {spectatorNavItems.map((item) => (
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
        <button className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default SpectatorHeader;
