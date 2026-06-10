import { useEffect, useState } from "react";
import {
  getPrizes, createPrize, deletePrize,
  getPendingProtests, ruleProtest,
  getPendingTransfers, approveTransfer, rejectTransfer,
  getContracts,
  getInjuries,
} from "../../services/managementApi";
import { getAdminTournaments } from "../../services/adminApi";

const fDate = (v) => v ? new Date(v).toLocaleDateString("en-US", { dateStyle: "medium" }) : "-";

// ── Reusable Modal ──
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="owner-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost-button" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Prize Management ──
export function PrizeManagement() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", amount: 0, position: 1, currency: "USD", tournamentId: "", raceId: "", sponsorName: "" });
  const [tournaments, setTournaments] = useState([]);
  const load = () => getPrizes().then((d) => setItems(Array.isArray(d) ? d : [])).catch((e) => setMsg(e.message));
  useEffect(() => { load(); getAdminTournaments().then((d) => setTournaments(Array.isArray(d) ? d : [])); }, []);

  const submit = async (ev) => { ev.preventDefault(); try { await createPrize({ ...form, amount: Number(form.amount), position: Number(form.position), tournamentId: form.tournamentId || null, raceId: form.raceId || null }); setMsg("Prize created."); load(); } catch (e) { setMsg(e.message); } };
  const remove = async (id) => { if (!confirm("Delete?")) return; try { await deletePrize(id); load(); } catch (e) { setMsg(e.message); } };

  return (
    <div>
      <h2>Prize Money</h2>
      <p style={{ color: "#98a1b3", marginBottom: 16 }}>Manage prize distribution for tournaments and races.</p>
      {msg && <p className="admin-notice">{msg}</p>}
      <form onSubmit={submit} className="admin-form" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input placeholder="Prize name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input type="number" placeholder="Position (1,2,3...)" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        <select value={form.tournamentId} onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}>
          <option value="">Tournament (optional)</option>
          {tournaments.map((t) => <option key={t.id ?? t.Id} value={t.id ?? t.Id}>{t.name ?? t.Name}</option>)}
        </select>
        <input placeholder="Sponsor" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} />
        <button className="primary-button" type="submit">Add Prize</button>
      </form>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Name</th><th>Amount</th><th>Pos</th><th>Sponsor</th><th>Distributed</th><th>Actions</th></tr></thead>
        <tbody>{items.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.amount} {p.currency}</td><td>#{p.position}</td><td>{p.sponsorName || "-"}</td><td>{p.isDistributed ? "Yes" : "No"}</td><td><button onClick={() => remove(p.id)}>Delete</button></td></tr>)}</tbody>
      </table></div>
    </div>
  );
}

// ── Protest Management ──
export function ProtestManagement() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState(null); // { id, type: "upheld"|"reject" }
  const [modalText, setModalText] = useState("");
  const load = () => getPendingProtests().then((d) => setItems(Array.isArray(d) ? d : [])).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const openRuleModal = (id, type) => { setModal({ id, type }); setModalText(""); };
  const submitRule = async () => {
    if (!modal) return;
    const ruling = modal.type === "upheld"
      ? `Upheld - ${modalText || "Protest upheld"}`
      : `Rejected - ${modalText || "Insufficient evidence"}`;
    try { await ruleProtest(modal.id, { ruling, resolution: modalText }); setMsg(`Protest ${modal.type === "upheld" ? "upheld" : "rejected"}.`); setModal(null); load(); }
    catch (e) { setMsg(e.message); }
  };

  return (
    <div>
      <h2>Protests</h2>
      <p style={{ color: "#98a1b3", marginBottom: 16 }}>Review and rule on race protests filed by owners and jockeys.</p>
      {msg && <p className="admin-notice">{msg}</p>}

      {modal && (
        <Modal title={modal.type === "upheld" ? "Upheld Protest - Details" : "Reject Protest - Reason"} onClose={() => setModal(null)}>
          <div className="form-group">
            <label>{modal.type === "upheld" ? "Resolution details" : "Rejection reason"}</label>
            <textarea className="form-textarea" rows={4} value={modalText} onChange={(e) => setModalText(e.target.value)}
              placeholder={modal.type === "upheld" ? "Describe the resolution..." : "Why is this protest being rejected?"} />
          </div>
          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button className="primary-button" onClick={submitRule}>{modal.type === "upheld" ? "Upheld" : "Reject"}</button>
            <button className="ghost-button" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {items.length === 0 ? <p className="muted">No pending protests.</p> : (
        <div className="admin-card-grid">
          {items.map((p) => (
            <article key={p.id} className="admin-simple-card">
              <span className="badge">{p.status}</span>
              <h3>{p.filedByName || "Unknown"}</h3>
              <p>Race: {p.raceName || p.raceId}</p>
              <p>Against: {p.againstHorseName || p.againstEntryId}</p>
              <p><strong>Reason:</strong> {p.reason}</p>
              {p.evidence && <p><strong>Evidence:</strong> {p.evidence}</p>}
              <p className="time">Filed: {fDate(p.filedAt)}</p>
              <div className="admin-actions" style={{ marginTop: 8 }}>
                <button onClick={() => openRuleModal(p.id, "upheld")}>Upheld</button>
                <button className="admin-danger" onClick={() => openRuleModal(p.id, "reject")}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Horse Transfer Management ──
export function TransferManagement() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [rejectModal, setRejectModal] = useState(null); // { id }
  const [rejectReason, setRejectReason] = useState("");
  const load = () => getPendingTransfers().then((d) => setItems(Array.isArray(d) ? d : [])).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const approve = async (id) => { try { await approveTransfer(id); setMsg("Transfer approved."); load(); } catch (e) { setMsg(e.message); } };
  const submitReject = async () => { if (!rejectModal) return; try { await rejectTransfer(rejectModal.id, rejectReason || "Rejected"); setMsg("Transfer rejected."); setRejectModal(null); load(); } catch (e) { setMsg(e.message); } };

  return (
    <div>
      <h2>Horse Transfers</h2>
      <p style={{ color: "#98a1b3", marginBottom: 16 }}>Review and approve horse ownership transfers.</p>
      {msg && <p className="admin-notice">{msg}</p>}

      {rejectModal && (
        <Modal title="Reject Transfer" onClose={() => setRejectModal(null)}>
          <div className="form-group">
            <label>Rejection reason</label>
            <textarea className="form-textarea" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why is this transfer being rejected?" />
          </div>
          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button className="primary-button" onClick={submitReject}>Reject Transfer</button>
            <button className="ghost-button" onClick={() => setRejectModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {items.length === 0 ? <p className="muted">No pending transfers.</p> : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Horse</th><th>From</th><th>To</th><th>Type</th><th>Price</th><th>Requested</th><th>Actions</th></tr></thead>
          <tbody>{items.map((t) => <tr key={t.id}><td>{t.horseName || t.horseId}</td><td>{t.fromOwnerName || "-"}</td><td>{t.toOwnerName || "-"}</td><td>{t.transferType}</td><td>{t.price ? `${t.price}` : "-"}</td><td>{fDate(t.requestedAt)}</td><td><div className="admin-actions"><button onClick={() => approve(t.id)}>Approve</button><button className="admin-danger" onClick={() => setRejectModal({ id: t.id })}>Reject</button></div></td></tr>)}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ── Contract Management ──
export function ContractManagement() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const load = () => getContracts().then((d) => setItems(Array.isArray(d) ? d : [])).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Contracts</h2>
      <p style={{ color: "#98a1b3", marginBottom: 16 }}>Owner-Jockey contracts and agreements.</p>
      {msg && <p className="admin-notice">{msg}</p>}
      {items.length === 0 ? <p className="muted">No contracts.</p> : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Title</th><th>Owner</th><th>Jockey</th><th>Horse</th><th>Status</th><th>Period</th><th>Fee</th></tr></thead>
          <tbody>{items.map((c) => <tr key={c.id}><td>{c.title}</td><td>{c.ownerName || "-"}</td><td>{c.jockeyName || "-"}</td><td>{c.horseName || "-"}</td><td><span className={`status status--${c.status?.toLowerCase()}`}>{c.status}</span></td><td>{fDate(c.startDate)} - {fDate(c.endDate)}</td><td>{c.baseFee ? `$${c.baseFee}` : "-"}</td></tr>)}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ── Injury Management ──
export function InjuryManagement() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const load = () => getInjuries().then((d) => setItems(Array.isArray(d) ? d : [])).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Injury Records</h2>
      <p style={{ color: "#98a1b3", marginBottom: 16 }}>Track horse injuries, treatment, and recovery status.</p>
      {msg && <p className="admin-notice">{msg}</p>}
      {items.length === 0 ? <p className="muted">No injury records.</p> : (
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Horse</th><th>Injury</th><th>Severity</th><th>Status</th><th>Veterinarian</th><th>Diagnosed</th><th>Cleared</th></tr></thead>
          <tbody>{items.map((r) => <tr key={r.id}><td>{r.horseName || r.horseId}</td><td>{r.injuryType}</td><td><span className="status status--inactive">{r.severity}</span></td><td><span className={`status status--${r.status?.toLowerCase()}`}>{r.status}</span></td><td>{r.veterinarianName || "-"}</td><td>{fDate(r.diagnosedAt)}</td><td>{r.clearedToRace ? "Yes" : "No"}</td></tr>)}</tbody>
        </table></div>
      )}
    </div>
  );
}
