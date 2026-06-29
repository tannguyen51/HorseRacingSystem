import { useEffect, useState } from "react";
import { request } from "../services/apiClient";
import "./ProfilePages.css";

const detailStyle = { padding: 16, border: "1px solid rgba(231,198,120,.1)", borderRadius: 12, background: "rgba(255, 255, 255, 0.88)" };
const labelStyle = { display: "block", color: "#657086", fontSize: 11, textTransform: "uppercase", marginBottom: 6 };
const valueStyle = { display: "block", color: "#34415b", fontSize: 14, fontWeight: 600, wordBreak: "break-word" };

const Detail = ({ label, value }) => (
  <div style={detailStyle}>
    <span style={labelStyle}>{label}</span>
    <strong style={valueStyle}>{value ?? "-"}</strong>
  </div>
);

const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 };

export function OwnerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="owner-page"><p>Đang tải...</p></div>;
  if (!profile) return <div className="owner-page"><p>Không tìm thấy hồ sơ.</p></div>;
  return (
    <div className="owner-page"><div className="owner-layout">
      <aside className="owner-sidebar">
        <div className="owner-sidebar__header"><p className="pill">Chủ ngựa</p><h3>Hồ sơ của tôi</h3></div>
        <div className="owner-sidebar__card owner-profile-stat">
          <p className="muted">Mã chủ ngựa</p>
          <h4 className="owner-profile-stat__code">
            {profile.code ?? profile.Code ?? "-"}
          </h4>
        </div>
        <div className="owner-sidebar__card owner-profile-stat">
          <p className="muted">Số ngựa</p>
          <h4 className="owner-profile-stat__number">
            {profile.horses ?? profile.Horses ?? 0}
          </h4>
        </div>
      </aside>
      <div className="owner-content">
        <section className="page-header"><h1>Hồ sơ</h1></section>
        <div style={gridStyle}>
          <Detail label="Họ tên" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Vai trò" value={profile.role ?? profile.Role} />
          <Detail label="Loại" value={profile.type ?? profile.Type} />
          <Detail label="Mã chủ ngựa" value={profile.code ?? profile.Code} />
          <Detail label="Số ngựa" value={profile.horses ?? profile.Horses} />
          <Detail label="Ngày tham gia" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"} />
        </div>
      </div>
    </div></div>
  );
}

export function JockeyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="jockey-page"><p>Đang tải...</p></div>;
  if (!profile) return <div className="jockey-page"><p>Không tìm thấy hồ sơ.</p></div>;
  return (
    <div className="jockey-page"><div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24 }}>
      <aside style={{ padding: 20, border: "1px solid rgba(231,198,120,.1)", borderRadius: 16, background: "rgba(255, 255, 255, 0.88)" }}>
        <p className="pill">Nài</p><h3 style={{ color: "#172033" }}>Hồ sơ của tôi</h3>
        <div style={{ marginTop: 16 }}><p className="muted">Hạng</p><h4 style={{ color: "#f2d28b" }}>#{profile.rank ?? profile.Rank ?? "-"}</h4></div>
        <div style={{ marginTop: 12 }}><p className="muted">Tỷ lệ thắng</p><h4 style={{ color: "#f2d28b" }}>{profile.winRate ?? profile.WinRate ?? 0}%</h4></div>
      </aside>
      <div>
        <section className="page-header"><h1>Hồ sơ nài</h1></section>
        <div style={gridStyle}>
          <Detail label="Tên" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Giấy phép" value={profile.licenseNumber ?? profile.LicenseNumber} />
          <Detail label="Quốc tịch" value={profile.nationality ?? profile.Nationality} />
          <Detail label="Kinh nghiệm" value={`${profile.experienceYears ?? profile.ExperienceYears ?? 0} năm`} />
          <Detail label="Tổng số cuộc đua" value={profile.totalRaces ?? profile.TotalRaces ?? 0} />
          <Detail label="Tổng số thắng" value={profile.totalWins ?? profile.TotalWins ?? 0} />
          <Detail label="Trạng thái" value={profile.status ?? profile.Status} />
        </div>
      </div>
    </div></div>
  );
}

export function RefereeProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="referee-page"><p>Đang tải...</p></div>;
  if (!profile) return <div className="referee-page"><p>Không tìm thấy hồ sơ.</p></div>;
  return (
    <div className="referee-page"><div className="referee-layout">
      <aside className="referee-sidebar">
        <div className="referee-sidebar__header"><p className="pill">Trọng tài</p><h3>Hồ sơ của tôi</h3></div>
        <div className="referee-sidebar__card"><p className="muted">Đánh giá</p><h4>{profile.rating ?? profile.Rating ?? 0}/5</h4></div>
        <div className="referee-sidebar__card"><p className="muted">Đã điều hành</p><h4>{profile.totalOfficiated ?? profile.TotalOfficiated ?? 0}</h4></div>
      </aside>
      <div className="referee-content">
        <section className="referee-hero"><div><span className="pill">Trọng tài</span><h1>Hồ sơ</h1></div></section>
        <div style={gridStyle}>
          <Detail label="Tên" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Giấy phép" value={profile.licenseNumber ?? profile.LicenseNumber} />
          <Detail label="Chuyên môn" value={profile.specialization ?? profile.Specialization} />
          <Detail label="Quốc tịch" value={profile.nationality ?? profile.Nationality} />
          <Detail label="Đánh giá" value={`${profile.rating ?? profile.Rating ?? 0}/5`} />
          <Detail label="Đã điều hành" value={`${profile.totalOfficiated ?? profile.TotalOfficiated ?? 0} cuộc đua`} />
          <Detail label="Trạng thái" value={(profile.isActive ?? profile.IsActive) ? "Hoạt động" : "Không hoạt động"} />
        </div>
      </div>
    </div></div>
  );
}

export function SpectatorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="spectator-page"><p>Đang tải...</p></div>;
  if (!profile) return <div className="spectator-page"><p>Không tìm thấy hồ sơ.</p></div>;
  return (
    <div className="spectator-page"><div className="spectator-layout">
      <aside className="spectator-sidebar">
        <div className="spectator-sidebar__header"><p className="pill">Khán giả</p><h3>Hồ sơ của tôi</h3></div>
      </aside>
      <div className="spectator-content">
        <section className="page-header"><h1>Hồ sơ khán giả</h1></section>
        <div style={gridStyle}>
          <Detail label="Họ tên" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Vai trò" value={profile.role ?? profile.Role} />
          <Detail label="Ngày tham gia" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"} />
        </div>
      </div>
    </div></div>
  );
}
