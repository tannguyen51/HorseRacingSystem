import { Link, NavLink } from "react-router-dom";
import { refereeNavItems } from "../../constants/refereeNavigation";
import ProfileDropdown from "../ProfileDropdown";
import "./RefereeHeader.css";

function RefereeHeader() {
  return (
    <header className="referee-header">
      <Link className="referee-header__brand" to="/referee">
        <div className="brand-mark">RM</div>
        <div><p className="brand-title">RaceMaster</p><p className="brand-subtitle">Cổng Trọng Tài</p></div>
      </Link>
      <nav className="referee-header__nav" aria-label="Referee">
        {refereeNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>{item.label}</NavLink>
        ))}
      </nav>
      <div className="referee-header__actions">
        <ProfileDropdown profileUrl="/referee/profile" />
      </div>
    </header>
  );
}

export default RefereeHeader;
