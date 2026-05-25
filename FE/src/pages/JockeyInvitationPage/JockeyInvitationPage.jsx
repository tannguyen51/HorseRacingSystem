import React, { useState, useEffect } from 'react';
import "../SpectatorSharedLayout.css"; 
import "./JockeyInvitationPage.css";   


const BASE_URL = 'http://localhost:5226'; 

export function JockeyInvitationPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/jockeys/invitations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Network response error');
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      
      setInvitations([
        { id: 1, raceName: "Bluegrass Sprint", date: "Today · 5:10 PM", horseName: "Thunder Strike", track: "Churchill Downs" },
        { id: 2, raceName: "Coastal Derby", date: "Tomorrow · 2:00 PM", horseName: "Silver Comet", track: "Gulfstream Park" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  
  const handleResponse = async (id, action) => {
    setLoadingId(id);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/jockeys/invitations/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' 
        })
      });

      if (!response.ok) throw new Error('Response submission failed');
      
      alert(`Successfully ${action === 'ACCEPT' ? 'accepted' : 'rejected'} the invitation!`);
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error("Error submitting response:", error);
      alert("Xử lý thất bại. Hệ thống tự động cập nhật UI mẫu (Xóa item).");
      
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="spectator-page jockey-invitations">
      <div className="spectator-layout">
        
        <aside className="spectator-sidebar">
          <div className="spectator-sidebar__header">
            <p className="pill">Jockey Panel</p>
            <h3>Rider Center</h3>
            <p className="muted">Manage your races and invitations.</p>
          </div>
          <div className="spectator-sidebar__card">
            <p className="muted">Pending Requests</p>
            <h4>Active Invitations</h4>
            <span>{invitations.length} requires attention</span>
          </div>
        </aside>

        <div className="spectator-content">
          <section className="spectator-hero">
            <div>
              <span className="pill">Action Required</span>
              <h1>Race Invitations</h1>
              <p>
                Review and respond to race invitations assigned to you by the organizers. 
                Please accept early to secure your jockey registration slot.
              </p>
            </div>
            <div className="spectator-hero__panel">
              <div>
                <span>Total Pending</span>
                <strong>{invitations.length}</strong>
              </div>
            </div>
          </section>

          <section className="spectator-section">
            <div className="section-heading">
              <h2>Pending Invitations</h2>
              <p>Respond to your designated race setups below.</p>
            </div>

            {loading ? (
              <div className="invitation-loading">
                <div className="skeleton-line" />
                <div className="skeleton-line wide" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="empty-state">
                <h4>No pending invitations</h4>
                <p>You are all caught up! New race invitations from organizers will appear here.</p>
              </div>
            ) : (
              <div className="live-grid">
                {invitations.map((inv) => (
                  <article key={inv.id} className="live-card hover-lift">
                    <div className="live-card__header">
                      <span className="badge">Pending</span>
                      <span className="muted">{inv.date}</span>
                    </div>
                    
                    <h3>{inv.raceName}</h3>
                    <p>{inv.track || "TBD Track"}</p>
                    
                    <div className="live-card__meta">
                      <div>
                        <span>Assigned Horse</span>
                        <strong>🐎 {inv.horseName}</strong>
                      </div>
                    </div>

                    <div className="invitation-actions">
                      <button 
                        type="button"
                        className="ghost-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(inv.id, 'REJECT')}
                      >
                        Decline
                      </button>
                      <button 
                        type="button"
                        className="primary-button"
                        disabled={loadingId !== null}
                        onClick={() => handleResponse(inv.id, 'ACCEPT')}
                      >
                        {loadingId === inv.id ? "Processing..." : "Accept Race"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
}

export default JockeyInvitationPage;