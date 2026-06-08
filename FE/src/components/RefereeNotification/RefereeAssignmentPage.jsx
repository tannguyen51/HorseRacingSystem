import { useState } from "react";
import { RefereeNotificationsPanel } from "./RefereeNotificationsPanel";
import "../../pages/RefereeSharedLayout.css";
import "./RefereeAssignmentPage.css";

export function RefereeAssignmentPage() {
  const [expandDetails, setExpandDetails] = useState(false);

  return (
    <div className="referee-page referee-assignments">
      <div className="referee-layout">
        <aside className="referee-sidebar">
          <div className="referee-sidebar__header">
            <p className="pill">Referee Panel</p>
            <h3>Match Assignments</h3>
            <p className="muted">Review upcoming duties.</p>
          </div>
          <div className="referee-sidebar__card">
            <p className="muted">Pending Response</p>
            <h4>Active Assignments</h4>
            <span>Check assignments below</span>
          </div>
        </aside>

        <div className="referee-content">
          <section className="referee-hero">
            <div>
              <span className="pill">Action Required</span>
              <h1>Match Assignments</h1>
              <p>
                Review and respond to referee assignments from tournament organizers.
                Accept or decline duties based on your availability and schedule.
              </p>
              <div className="referee-hero__actions">
                <button 
                  className="primary-button" 
                  onClick={() => setExpandDetails(!expandDetails)}
                >
                  {expandDetails ? "Hide" : "Show"} Guidelines
                </button>
              </div>
            </div>
            <div className="referee-hero__panel">
              <span>Your Role</span>
              <strong>Match Official</strong>
            </div>
          </section>

          <section className="referee-section">
            <div className="section-heading">
              <h2>Pending Assignments</h2>
              <p>Respond to your designated matches and tournaments below.</p>
            </div>
            <RefereeNotificationsPanel />
          </section>

          {expandDetails && (
            <section className="referee-section guidelines-section">
              <h2>Referee Guidelines</h2>
              <div className="guidelines-grid">
                <div className="guideline-card">
                  <h4>Responsibilities</h4>
                  <ul>
                    <li>Monitor the race for rule violations</li>
                    <li>Record time and placement data</li>
                    <li>Document any incidents or protests</li>
                    <li>Submit official race report</li>
                  </ul>
                </div>

                <div className="guideline-card">
                  <h4>Before the Match</h4>
                  <ul>
                    <li>Arrive 30 minutes early</li>
                    <li>Review horse and jockey profiles</li>
                    <li>Inspect track conditions</li>
                    <li>Attend mandatory referee briefing</li>
                  </ul>
                </div>

                <div className="guideline-card">
                  <h4>During the Match</h4>
                  <ul>
                    <li>Position for optimal visibility</li>
                    <li>Monitor for rule violations</li>
                    <li>Record results in real-time</li>
                    <li>Be available for clarifications</li>
                  </ul>
                </div>

                <div className="guideline-card">
                  <h4>After the Match</h4>
                  <ul>
                    <li>Document any incidents</li>
                    <li>Submit official report</li>
                    <li>Notify organizers of issues</li>
                    <li>Archive all documentation</li>
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
