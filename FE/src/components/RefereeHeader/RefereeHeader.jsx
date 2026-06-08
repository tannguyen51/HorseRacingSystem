import { Link, NavLink, useNavigate } from "react-router-dom";
import { refereeNavItems } from "../../constants/refereeNavigation";
import "./RefereeHeader.css";

function RefereeHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  return (
    <header className="referee-header">
      <Link className="referee-header__brand" to="/referee">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Referee Portal</p>
        </div>
      </Link>

      <nav className="referee-header__nav" aria-label="Referee">
        {refereeNavItems.map((item) => (
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

      <div className="referee-header__actions">
        <button className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default RefereeHeader;
