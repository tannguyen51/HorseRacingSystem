import { useState, useEffect } from "react";
import { request } from "../services/apiClient";
import { getAdminTournaments } from "../services/adminApi";
import { Input, Textarea, Button, Select } from "./ui/Primitives";
import { colors } from "../styles/designTokens";

function RaceForm({ tournamentId, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [referees, setReferees] = useState([]);
  const [horses, setHorses] = useState([]);

  const [form, setForm] = useState({
    tournamentId: tournamentId || "",
    trackId: "",
    name: "",
    distance: 1200,
    maxParticipants: 8,
    scheduledAt: "",
  });

  const [selectedRefereeIds, setSelectedRefereeIds] = useState([]);
  const [selectedHorseIds, setSelectedHorseIds] = useState([]);

  useEffect(() => {
    loadTournaments();
    loadTracks();
    loadReferees();
    loadHorses();
  }, []);

  const loadTournaments = async () => {
    try {
      const list = await getAdminTournaments();
      setTournaments(Array.isArray(list) ? list : []);
    } catch { /* empty */ }
  };

  const loadTracks = async () => {
    try {
      const list = await request("/api/tracks");
      setTracks(Array.isArray(list) ? list : list?.data ?? []);
    } catch { /* empty */ }
  };

  const loadReferees = async () => {
    try {
      const list = await request("/api/referees");
      setReferees(Array.isArray(list) ? list : list?.data ?? []);
    } catch { /* empty */ }
  };

  const loadHorses = async () => {
    try {
      const list = await request("/api/horses");
      setHorses(Array.isArray(list) ? list : list?.data ?? []);
    } catch { /* empty */ }
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // 1. Create race
      const racePayload = {
        tournamentId: form.tournamentId,
        name: form.name,
        distance: Number(form.distance),
        maxParticipants: Number(form.maxParticipants),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        location: tracks.find((track) => (track.id || track.Id) === form.trackId)?.name
          ?? tracks.find((track) => (track.id || track.Id) === form.trackId)?.Name
          ?? null,
      };

      const raceRes = await request("/api/races/management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(racePayload),
      });
      const raceId = raceRes?.data?.id ?? raceRes?.id;

      if (!raceId) throw new Error("Không lấy được ID cuộc đua");

      // 2. Assign referees
      if (selectedRefereeIds.length > 0) {
        await Promise.all(
          selectedRefereeIds.map((refereeId) =>
            request(`/api/races/${raceId}/referees`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refereeId }),
            })
          )
        );
      }

      // 3. Assign horses
      if (selectedHorseIds.length > 0) {
        await request(`/api/races/management/${raceId}/bulk-assign-horses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horseIds: selectedHorseIds }),
        });
      }

      onSuccess();
    } catch (err) {
      setError(err.message || "Lỗi tạo cuộc đua");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 800,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 32,
        }}
      >
        <h2 style={{ margin: "0 0 24px", fontSize: 24, color: colors.ink }}>
          Tạo cuộc đua mới
        </h2>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Select
              label="Giải đấu"
              value={form.tournamentId}
              onChange={(e) => updateForm("tournamentId", e.target.value)}
              required
              options={[
                { value: "", label: "-- Chọn giải đấu --" },
                ...tournaments.map((t) => ({
                  value: t.id || t.Id,
                  label: t.name || t.Name,
                })),
              ]}
            />

            <Select
              label="Đường đua"
              value={form.trackId}
              onChange={(e) => updateForm("trackId", e.target.value)}
              options={[
                { value: "", label: "-- Chọn đường đua --" },
                ...tracks.map((t) => ({
                  value: t.id || t.Id,
                  label: t.name || t.Name,
                })),
              ]}
            />
          </div>

          <Input
            label="Tên cuộc đua"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Chung kết 1200m"
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Input
              label="Khoảng cách (m)"
              type="number"
              value={form.distance}
              onChange={(e) => updateForm("distance", e.target.value)}
              min="100"
              step="100"
            />

            <Input
              label="Số ngựa tối đa"
              type="number"
              value={form.maxParticipants}
              onChange={(e) => updateForm("maxParticipants", e.target.value)}
              min="2"
              max="20"
            />
          </div>

          <Input
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => updateForm("scheduledAt", e.target.value)}
            required
          />

          {/* Referees */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12, color: colors.ink }}>
              Chọn trọng tài ({selectedRefereeIds.length} đã chọn)
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
                maxHeight: 200,
                overflowY: "auto",
              }}
            >
              {referees.map((ref) => {
                const id = ref.id || ref.Id;
                const checked = selectedRefereeIds.includes(id);
                return (
                  <label
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 12,
                      background: checked ? "#f0f9ff" : "transparent",
                      border: `2px solid ${checked ? "#3b82f6" : "#e5e7eb"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRefereeIds([...selectedRefereeIds, id]);
                        } else {
                          setSelectedRefereeIds(selectedRefereeIds.filter((i) => i !== id));
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{ref.fullName || ref.FullName}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Horses */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12, color: colors.ink }}>
              Chọn ngựa ({selectedHorseIds.length} đã chọn)
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              {horses.map((horse) => {
                const id = horse.id || horse.Id;
                const checked = selectedHorseIds.includes(id);
                return (
                  <label
                    key={id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: 12,
                      background: checked ? "#f0fdf4" : "transparent",
                      border: `2px solid ${checked ? "#10b981" : "#e5e7eb"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHorseIds([...selectedHorseIds, id]);
                        } else {
                          setSelectedHorseIds(selectedHorseIds.filter((i) => i !== id));
                        }
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{horse.name || horse.Name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {horse.breed || horse.Breed}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <Button variant="ghost" onClick={onClose} type="button">
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RaceForm;
