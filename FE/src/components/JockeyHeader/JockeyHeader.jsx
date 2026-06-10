import { Link, NavLink } from "react-router-dom";
import { jockeyNavItems } from "../../constants/jockeyNavigation";
import ProfileDropdown from "../ProfileDropdown";
import "./JockeyHeader.css";

function JockeyHeader() {
  return (
    <header className="jockey-header">
      <Link className="jockey-header__brand" to="/jockey/invitations">
        <div className="brand-mark">RM</div>
        <div><p className="brand-title">RaceMaster</p><p className="brand-subtitle">Jockey Hub</p></div>
      </Link>
      <nav className="jockey-header__nav" aria-label="Jockey">
        {jockeyNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>{item.label}</NavLink>
        ))}
      </nav>
      <div className="jockey-header__actions">
        <ProfileDropdown profileUrl="/jockey/profile" />
      </div>
    </header>
  );
}

export default JockeyHeader;
