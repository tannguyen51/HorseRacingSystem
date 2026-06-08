import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatJockeyDate,
  getJockeyAssignedRaces,
  getJockeyInvitations,
} from "../../services/jockeyApi";
import "../SpectatorSharedLayout.css";
import "./JockeyDashboardPage.css";

const fallbackRaces = [
  {
    id: "sample-race-1",
    title: "Coastal Derby",
    scheduledAt: "2026-06-12T09:30:00Z",
    location: "Gulfstream Park",
    tournamentName: "Summer Racing Cup",
    status: "Assigned",
    jockeyConfirmed: true,
    horseName: "Silver Comet",
    horseTotalRaces: 12,
    horseTotalWins: 4,
  },
  {
    id: "sample-race-2",
    title: "Golden Mile",
    scheduledAt: "2026-06-17T08:00:00Z",
    location: "Santa Anita",
    tournamentName: "Elite Track Series",
    status: "Scheduled",
    jockeyConfirmed: true,
    horseName: "Midnight Runner",
    horseTotalRaces: 18,
    horseTotalWins: 6,
  },
];

function JockeyDashboardPage() {
  const [races, setRaces] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [raceData, invitationData] = await Promise.all([
          getJockeyAssignedRaces(),
          getJockeyInvitations(),
        ]);

        if (!cancelled) {
          setRaces(raceData);
          setInvitations(invitationData);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setRaces(fallbackRaces);
          setInvitations([]);
          setErrorMessage(
            error.message || "Unable to load jockey dashboard data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRaces = useMemo(
    () =>
      [...races].sort((first, second) => {
        const firstTime = new Date(first.scheduledAt).getTime();
        const secondTime = new Date(second.scheduledAt).getTime();
        return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime);
      }),
    [races],
  );

  const nextRace = sortedRaces[0];
  const totalHorseRaces = races.reduce(
    (sum, race) => sum + Number(race.horseTotalRaces || 0),
    0,
  );
  const totalHorseWins = races.reduce(
    (sum, race) => sum + Number(race.horseTotalWins || 0),
    0,
  );
  const winRate =
    totalHorseRaces > 0 ? `${Math.round((totalHorseWins / totalHorseRaces) * 100)}%` : "0%";

  return (
    <div className="spectator-page jockey-dashboard">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Jockey Dashboard</p>
            <h3>Rider command</h3>
            <p className="muted">Assigned races, invitations, and readiness.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Next schedule</p>
            <h4>{nextRace?.title ?? "No race assigned"}</h4>
            <span>{formatJockeyDate(nextRace?.scheduledAt, "Waiting")}</span>
          </div>
          <div className="jockey-side-actions">
            <Link to="/jockey/invitations" className="jockey-side-link">
              Manage invitations
            </Link>
            <Link to="/jockey/schedule" className="jockey-side-link">
              Open race calendar
            </Link>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="jockey-hero">
            <div>
              <span className="pill">Rider overview</span>
              <h1>Jockey Dashboard</h1>
              <p>
                Review assigned races, keep your upcoming schedule clear, and
                monitor performance before race day.
              </p>
              {errorMessage ? <p className="jockey-inline-warning">{errorMessage}</p> : null}
            </div>
            <div className="jockey-hero__panel">
              <div>
                <span>Assigned races</span>
                <strong>{loading ? "--" : races.length}</strong>
              </div>
              <div>
                <span>Pending invitations</span>
                <strong>{loading ? "--" : invitations.length}</strong>
              </div>
              <div>
                <span>Win summary</span>
                <strong>{winRate}</strong>
              </div>
            </div>
          </section>

          <section className="jockey-stat-grid">
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Assigned races</p>
              <h3>{races.length}</h3>
              <span>Confirmed ride list</span>
            </article>
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Upcoming schedule</p>
              <h3>{nextRace ? formatJockeyDate(nextRace.scheduledAt) : "None"}</h3>
              <span>{nextRace?.location ?? "No track booked"}</span>
            </article>
            <article className="jockey-stat-card hover-lift">
              <p className="muted">Performance summary</p>
              <h3>{winRate}</h3>
              <span>{totalHorseWins} wins from assigned mounts</span>
            </article>
          </section>

          <section className="jockey-dashboard-grid">
            <div className="jockey-panel">
              <div className="section-heading">
                <h2>Upcoming Schedule</h2>
                <p>Your nearest confirmed race assignments.</p>
              </div>
              <div className="jockey-list">
                {sortedRaces.slice(0, 4).map((race) => (
                  <article key={race.id} className="jockey-list-item">
                    <div>
                      <span className="badge">{race.status}</span>
                      <h3>{race.title}</h3>
                      <p className="muted">{race.tournamentName}</p>
                    </div>
                    <div className="jockey-list-item__meta">
                      <strong>{formatJockeyDate(race.scheduledAt)}</strong>
                      <span>{race.location}</span>
                      <span>Horse: {race.horseName}</span>
                    </div>
                  </article>
                ))}
                {!loading && sortedRaces.length === 0 ? (
                  <p className="muted">No assigned races yet.</p>
                ) : null}
              </div>
            </div>

            <div className="jockey-panel">
              <div className="section-heading">
                <h2>Invitation Management</h2>
                <p>Race offers waiting for your response.</p>
              </div>
              <div className="jockey-list">
                {invitations.slice(0, 3).map((invitation) => (
                  <article key={invitation.id} className="jockey-list-item">
                    <div>
                      <span className="badge">{invitation.status}</span>
                      <h3>{invitation.raceName}</h3>
                      <p className="muted">Horse: {invitation.horseName}</p>
                    </div>
                    <Link
                      to={`/jockey/invitations/${invitation.id}`}
                      className="jockey-text-link"
                    >
                      View detail
                    </Link>
                  </article>
                ))}
                {!loading && invitations.length === 0 ? (
                  <p className="muted">No pending invitations.</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default JockeyDashboardPage;
