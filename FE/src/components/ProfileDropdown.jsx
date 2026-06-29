import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const getInitials = (name) => (name || "Người dùng").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function ProfileDropdown({ profileUrl }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("authUser") || "null");
      setUser(stored);
    } catch { setUser(null); }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.assign("/login");
  };

  const fullName = user?.fullName || user?.email || "Người dùng";
  const email = user?.email || "";
  const role = user?.role || "người dùng";

  const ROLE_LABELS = {
    horse_owner: "Chủ Ngựa",
    jockey: "Kỵ Sĩ",
    spectator: "Khán giả",
    referee: "Trọng tài",
    admin: "Quản trị viên",
  };

  return (
    <div className="profile-dropdown" style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "1px solid rgba(231,198,120,.2)", borderRadius: 12,
          padding: "6px 14px 6px 6px", cursor: "pointer", color: "#34415b",
        }}
      >
        <span style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, #d7aa4d, #c4902e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#14100a", fontWeight: 700, fontSize: 13,
        }}>
          {getInitials(fullName)}
        </span>
        <span style={{ fontSize: 13, textAlign: "left" }}>
          <span style={{ display: "block", color: "#172033", lineHeight: 1.2 }}>{fullName}</span>
          <span style={{ display: "block", color: "#657086", fontSize: 11, lineHeight: 1.2 }}>{ROLE_LABELS[role] || role}</span>
        </span>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 100,
            minWidth: 200, background: "rgba(255, 255, 255, 0.88)", border: "1px solid rgba(231,198,120,.15)",
            borderRadius: 14, padding: 16, boxShadow: "0 12px 32px rgba(23, 32, 51, 0.12)",
          }}>
            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(231,198,120,.1)" }}>
              <p style={{ color: "#172033", fontWeight: 600, margin: 0, fontSize: 14 }}>{fullName}</p>
              <p style={{ color: "#657086", margin: "4px 0 0", fontSize: 12, wordBreak: "break-all" }}>{email}</p>
            </div>
            {profileUrl && (
              <Link to={profileUrl} onClick={() => setOpen(false)} style={{
                display: "block", padding: "8px 10px", borderRadius: 8, color: "#34415b",
                textDecoration: "none", fontSize: 13, marginBottom: 4,
              }} onMouseOver={(e) => e.target.style.background = "rgba(231,198,120,.08)"} onMouseOut={(e) => e.target.style.background = "none"}>
                Hồ sơ
              </Link>
            )}
            <button onClick={handleLogout} style={{
              display: "block", width: "100%", textAlign: "left", padding: "8px 10px",
              borderRadius: 8, border: "none", background: "none", color: "#fca5a5",
              cursor: "pointer", fontSize: 13, marginTop: 2,
            }} onMouseOver={(e) => e.target.style.background = "rgba(248,113,113,.08)"} onMouseOut={(e) => e.target.style.background = "none"}>
              Đăng xuất
            </button>
          </div>
        </>
      )}
    </div>
  );
}
