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
          <small>Bảng điều khiển quản trị</small>
        </span>
      </Link>
      <div className="admin-header__actions">
        <span className="admin-header__status">Hệ thống đang hoạt động</span>
        <button className="ghost-button" onClick={logout}>Đăng xuất</button>
      </div>
    </header>
  );
}

export default AdminHeader;
