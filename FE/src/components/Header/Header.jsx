import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/tournaments", label: "Tournament List" },
  { to: "/schedule", label: "Race Schedule" },
  { to: "/live-results", label: "Live Results" },
  { to: "/leaderboard", label: "Leaderboard" },
];

function Header({ isLoggedIn = false }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  return (
    <header className="site-header navbar navbar-expand-xl">
      <Link className="site-header__brand navbar-brand" to="/">
        <div className="brand-mark">RM</div>
        <div>
          <p className="brand-title">RaceMaster</p>
          <p className="brand-subtitle">Tournament Platform</p>
        </div>
      </Link>

      <nav className="site-header__nav navbar-nav" aria-label="Primary">
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
        {isLoggedIn ? (
          <button className="ghost-button btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link className="ghost-button btn" to="/login">
              Login
            </Link>
            <Link className="primary-button btn" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
