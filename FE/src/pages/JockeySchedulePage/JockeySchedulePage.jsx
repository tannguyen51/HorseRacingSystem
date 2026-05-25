import React, { useState, useEffect } from 'react';
import "../SpectatorSharedLayout.css";
import "./JockeySchedulePage.css";

const BASE_URL = 'http://localhost:5226';

export function JockeySchedulePage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null); 

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken'); 

        const response = await fetch(`${BASE_URL}/api/jockeys/races`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' 
          }
        });

        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        
        if (Array.isArray(data)) {
          setRaces(data);
        } else if (data && Array.isArray(data.races)) {
          setRaces(data.races);
        } else if (data && Array.isArray(data.data)) {
          setRaces(data.data);
        } else {
          setRaces([]);
        }
      } catch (error) {
        console.error("Error fetching races:", error);
        setRaces([]);
        setSelectedRace(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  return (
    <div className="spectator-page jockey-schedule">
      <div className="spectator-layout">
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Jockey Panel</p>
            <h3>Race Calendar</h3>
            <p className="muted">Your upcoming riding schedule.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Next Engagement</p>
            <h4>{races[0]?.title || "None booked"}</h4>
            <span>{races[0]?.time || "--"}</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="spectator-hero">
            <div>
              <span className="pill">Schedule Overview</span>
              <h1>Assigned Races & Calendar</h1>
              <p>Track your confirmed bookings, inspect your assigned horses' metrics, and review upcoming race tracks.</p>
            </div>
          </section>

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Upcoming Race Cards</h2>
              <p>Click "View Details" to analyze horse profiles and track information.</p>
            </div>

            {loading ? (
              <div className="skeleton-line wide" />
            ) : (
              <div className="upcoming-grid">
                {Array.isArray(races) && races.length > 0 ? (
                  races.map((race) => (
                    <article key={race.id} className="mini-card hover-lift">
                      <div className="card-header-row">
                        <h4>{race.title}</h4>
                        <span className={`status-badge ${race.status?.toLowerCase() || 'pending'}`}>{race.status}</span>
                      </div>
                      <p className="muted">⏱ {race.time}</p>
                      <span className="track-name">📍 {race.track}</span>
                      <div className="card-footer-row">
                        <span className="horse-tag">🐎 {race.horse?.name || "Unknown"}</span>
                        <button className="ghost-button" onClick={() => setSelectedRace(race)}>View Details</button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="muted">No match schedule could be found.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedRace && (
        <div className="modal-overlay" onClick={() => setSelectedRace(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Race & Horse Profile</h2>
              <button className="close-button" onClick={() => setSelectedRace(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="info-group">
                <h3>🏆 Event: {selectedRace.title}</h3>
                <p><strong>Track Location:</strong> {selectedRace.track}</p>
                <p><strong>Schedule:</strong> {selectedRace.time}</p>
                <p><strong>Total Prize Pool:</strong> {selectedRace.prize}</p>
              </div>
              <hr />
              <div className="info-group">
                <h3>🐎 Assigned Horse Metrics</h3>
                <p><strong>Name:</strong> {selectedRace.horse?.name || "Unknown"}</p>
                <p><strong>Age:</strong> {selectedRace.horse?.age ? `${selectedRace.horse.age} years old` : "N/A"}</p>
                <p><strong>Weight:</strong> {selectedRace.horse?.weight || "N/A"}</p>
                <p><strong>Recent Form (Past Races):</strong> <span className="form-badge">{selectedRace.horse?.form || "N/A"}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JockeySchedulePage;