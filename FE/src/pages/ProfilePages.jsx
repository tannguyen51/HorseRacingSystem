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
  if (loading) return <div className="owner-page"><p>Loading...</p></div>;
  if (!profile) return <div className="owner-page"><p>Profile not found.</p></div>;
  return (
    <div className="owner-page"><div className="owner-layout">
      <aside className="owner-sidebar">
        <div className="owner-sidebar__header"><p className="pill">Horse Owner</p><h3>My Profile</h3></div>
        <div className="owner-sidebar__card owner-profile-stat">
          <p className="muted">Owner Code</p>
          <h4 className="owner-profile-stat__code">
            {profile.code ?? profile.Code ?? "-"}
          </h4>
        </div>
        <div className="owner-sidebar__card owner-profile-stat">
          <p className="muted">Horses</p>
          <h4 className="owner-profile-stat__number">
            {profile.horses ?? profile.Horses ?? 0}
          </h4>
        </div>
      </aside>
      <div className="owner-content">
        <section className="page-header"><h1>Profile</h1></section>
        <div style={gridStyle}>
          <Detail label="Full Name" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Role" value={profile.role ?? profile.Role} />
          <Detail label="Type" value={profile.type ?? profile.Type} />
          <Detail label="Owner Code" value={profile.code ?? profile.Code} />
          <Detail label="Horses" value={profile.horses ?? profile.Horses} />
          <Detail label="Joined" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"} />
        </div>
      </div>
    </div></div>
  );
}

export function JockeyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="jockey-page"><p>Loading...</p></div>;
  if (!profile) return <div className="jockey-page"><p>Profile not found.</p></div>;
  return (
    <div className="jockey-page"><div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24 }}>
      <aside style={{ padding: 20, border: "1px solid rgba(231,198,120,.1)", borderRadius: 16, background: "rgba(255, 255, 255, 0.88)" }}>
        <p className="pill">Jockey</p><h3 style={{ color: "#172033" }}>My Profile</h3>
        <div style={{ marginTop: 16 }}><p className="muted">Rank</p><h4 style={{ color: "#f2d28b" }}>#{profile.rank ?? profile.Rank ?? "-"}</h4></div>
        <div style={{ marginTop: 12 }}><p className="muted">Win Rate</p><h4 style={{ color: "#f2d28b" }}>{profile.winRate ?? profile.WinRate ?? 0}%</h4></div>
      </aside>
      <div>
        <section className="page-header"><h1>Jockey Profile</h1></section>
        <div style={gridStyle}>
          <Detail label="Name" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="License" value={profile.licenseNumber ?? profile.LicenseNumber} />
          <Detail label="Nationality" value={profile.nationality ?? profile.Nationality} />
          <Detail label="Experience" value={`${profile.experienceYears ?? profile.ExperienceYears ?? 0} years`} />
          <Detail label="Total Races" value={profile.totalRaces ?? profile.TotalRaces ?? 0} />
          <Detail label="Total Wins" value={profile.totalWins ?? profile.TotalWins ?? 0} />
          <Detail label="Status" value={profile.status ?? profile.Status} />
        </div>
      </div>
    </div></div>
  );
}

export function RefereeProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="referee-page"><p>Loading...</p></div>;
  if (!profile) return <div className="referee-page"><p>Profile not found.</p></div>;
  return (
    <div className="referee-page"><div className="referee-layout">
      <aside className="referee-sidebar">
        <div className="referee-sidebar__header"><p className="pill">Referee</p><h3>My Profile</h3></div>
        <div className="referee-sidebar__card"><p className="muted">Rating</p><h4>{profile.rating ?? profile.Rating ?? 0}/5</h4></div>
        <div className="referee-sidebar__card"><p className="muted">Officiated</p><h4>{profile.totalOfficiated ?? profile.TotalOfficiated ?? 0}</h4></div>
      </aside>
      <div className="referee-content">
        <section className="referee-hero"><div><span className="pill">Referee</span><h1>Profile</h1></div></section>
        <div style={gridStyle}>
          <Detail label="Name" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="License" value={profile.licenseNumber ?? profile.LicenseNumber} />
          <Detail label="Specialization" value={profile.specialization ?? profile.Specialization} />
          <Detail label="Nationality" value={profile.nationality ?? profile.Nationality} />
          <Detail label="Rating" value={`${profile.rating ?? profile.Rating ?? 0}/5`} />
          <Detail label="Officiated" value={`${profile.totalOfficiated ?? profile.TotalOfficiated ?? 0} races`} />
          <Detail label="Status" value={(profile.isActive ?? profile.IsActive) ? "Active" : "Inactive"} />
        </div>
      </div>
    </div></div>
  );
}

export function SpectatorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { request("/api/auth/profile").then((d) => setProfile(d?.data ?? d)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="spectator-page"><p>Loading...</p></div>;
  if (!profile) return <div className="spectator-page"><p>Profile not found.</p></div>;
  return (
    <div className="spectator-page"><div className="spectator-layout">
      <aside className="spectator-sidebar">
        <div className="spectator-sidebar__header"><p className="pill">Spectator</p><h3>My Profile</h3></div>
      </aside>
      <div className="spectator-content">
        <section className="page-header"><h1>Spectator Profile</h1></section>
        <div style={gridStyle}>
          <Detail label="Full Name" value={profile.fullName ?? profile.FullName} />
          <Detail label="Email" value={profile.email ?? profile.Email} />
          <Detail label="Role" value={profile.role ?? profile.Role} />
          <Detail label="Joined" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"} />
        </div>
      </div>
    </div></div>
  );
}
