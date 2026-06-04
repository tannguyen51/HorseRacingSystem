import { Link, useNavigate } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <header className="admin-header">
      <Link className="admin-header__brand" to="/admin">
        <span className="admin-header__mark">RM</span>
        <span>
          <strong>RaceMaster</strong>
          <small>Administration Console</small>
        </span>
      </Link>
      <div className="admin-header__actions">
        <span className="admin-header__status">System online</span>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}

export default AdminHeader;
