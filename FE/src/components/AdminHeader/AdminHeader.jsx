import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileDropdown from "../ProfileDropdown";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./AdminHeader.css";

const adminNavItems = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/users", label: "Người dùng" },
  { to: "/admin/tournaments", label: "Giải đấu" },
  { to: "/admin/races", label: "Cuộc đua" },
  { to: "/admin/prizes", label: "Báo cáo" },
  { to: "/admin/audit", label: "Hệ thống" },
];

function AdminHeader() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="admin-header">
      <Link className="admin-header__brand" to="/admin">
        <img src="/logo.png" alt="RaceMaster" className="header-logo" />
      </Link>
      <nav className="admin-header__nav" aria-label="Admin">
        {adminNavItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-header__actions">
        <form className="ah-search" onSubmit={handleSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <kbd>⌘K</kbd>
        </form>
        <NotificationBell />
        <ProfileDropdown profileUrl="/admin" />
      </div>
    </header>
  );
}

export default AdminHeader;
