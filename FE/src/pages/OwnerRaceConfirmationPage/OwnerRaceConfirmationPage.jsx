import { useEffect, useMemo, useState } from "react";
import { confirmRaceEntry, getMyRaceEntries } from "../../services/ownerHorseApi";
import "../OwnerSharedLayout.css";
import "./OwnerRaceConfirmationPage.css";

function OwnerRaceConfirmationPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyRaceEntries();
        const list = Array.isArray(data) ? data : [];
        const all = list.map((entry) => ({
          horseName: entry.horseName ?? entry.HorseName ?? "Unknown",
          horseId: entry.horseId ?? entry.HorseId,
          entryId: entry.entryId ?? entry.EntryId ?? entry.id,
          raceId: entry.raceId ?? entry.RaceId,
          raceName: entry.raceName ?? entry.RaceName ?? entry.raceId ?? entry.RaceId,
          status: entry.status ?? entry.Status ?? "Pending",
        }));
        if (!ignore) setEntries(all);
      } catch (e) {
        if (!ignore) setMsg("Error loading entries: " + e.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const statusCounts = useMemo(
    () =>
      entries.reduce(
        (counts, entry) => ({
          ...counts,
          [entry.status]: (counts[entry.status] ?? 0) + 1,
        }),
        {},
      ),
    [entries],
  );

  const handleConfirm = async (raceId, entryId) => {
    try {
      await confirmRaceEntry(raceId, entryId);
      setMsg("Entry confirmed!");
      setEntries((prev) =>
        prev.map((e) =>
          e.entryId === entryId ? { ...e, status: "Confirmed" } : e,
        ),
      );
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  return (
    <div className="owner-page owner-race-confirmation">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Horse Owner</p>
            <h3>Race confirmations</h3>
            <p className="muted">Approve or reject upcoming entries.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Pending confirmations</p>
            <h4>{statusCounts.Pending ?? 0} pending</h4>
            <span>Awaiting owner action</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Confirmed</p>
            <h4>{statusCounts.Confirmed ?? 0} confirmed</h4>
            <span>Ready to participate</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Race confirmations</h1>
            <p>Confirm your horses' participation in scheduled races.</p>
          </section>

          <section className="confirmation-summary">
            <article><span>Pending</span><strong>{statusCounts.Pending ?? 0}</strong><p>Need a decision</p></article>
            <article><span>Confirmed</span><strong>{statusCounts.Confirmed ?? 0}</strong><p>Participation locked</p></article>
            <article><span>Total</span><strong>{entries.length}</strong><p>Total entries</p></article>
          </section>

          <section className="confirmation-grid">
            {loading ? (
              <p>Loading entries...</p>
            ) : entries.length === 0 ? (
              <p className="muted">No pending race entries found. Register your horses in tournaments first.</p>
            ) : (
              entries.map((entry) => (
                <article key={entry.entryId} className="confirmation-card">
                  <div className="confirmation-header">
                    <div>
                      <h3>{entry.horseName}</h3>
                      <p className="muted">Race: {entry.raceName}</p>
                    </div>
                    <span className={`confirmation-status confirmation-status--${(entry.status || "pending").toLowerCase()}`}>
                      {entry.status || "Pending"}
                    </span>
                  </div>
                  <div className="confirmation-meta">
                    <div><span>Gate</span><strong>{entry.gateNumber ?? "-"}</strong></div>
                    <div><span>Jockey</span><strong>{entry.jockeyConfirmed ? "Confirmed" : "Pending"}</strong></div>
                  </div>
                  <div className="confirmation-actions">
                    <button
                      className="confirmation-action confirmation-action--confirm"
                      onClick={() => handleConfirm(entry.raceId, entry.entryId)}
                      disabled={entry.status === "Confirmed"}
                    >
                      Confirm participation
                    </button>
                  </div>
                </article>
              ))
            )}
            {msg && <p className={msg.startsWith("Error") ? "form-error" : "form-success"}>{msg}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerRaceConfirmationPage;
