import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../../services/apiClient";
import { getOwnerHorses } from "../../services/adminApi";
import {
  StatusPill,
  Button,
  Badge,
} from "../../components/ui/Primitives";
import { StateStepper } from "../../components/ui/StateStepper";
import { HeroBanner } from "../../components/ui/HeroBanner";
import { PageLayout, TwoColumnLayout, TabBar } from "../../components/ui/Layout";
import { colors, spacing } from "../../styles/designTokens";

function RaceManagementPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("horses");
  const [selectedHorses, setSelectedHorses] = useState([]);
  const [availableHorses, setAvailableHorses] = useState([]);
  const [assignedHorses, setAssignedHorses] = useState([]);
  const [referees, setReferees] = useState([]);
  const [selectedReferees, setSelectedReferees] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRaceData();
  }, [raceId]);

  const loadRaceData = async () => {
    try {
      const [raceData, horsesData, refereesData] = await Promise.all([
        request(`/api/races/${raceId}`),
        getOwnerHorses(),
        request("/api/referees"),
      ]);

      setRace(raceData);
      setAvailableHorses(Array.isArray(horsesData) ? horsesData : []);
      setReferees(Array.isArray(refereesData) ? refereesData : []);

      // Load assigned horses
      const entries = await request(`/api/races/${raceId}/entries`);
      setAssignedHorses(Array.isArray(entries) ? entries : []);

      // Load assigned referees
      const raceReferees = await request(`/api/races/${raceId}/referees`);
      setSelectedReferees(Array.isArray(raceReferees) ? raceReferees : []);
    } catch (err) {
      setMessage("Lỗi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHorses = async () => {
    if (selectedHorses.length === 0) {
      setMessage("Vui lòng chọn ít nhất 1 ngựa");
      return;
    }

    try {
      await request(`/api/races/management/${raceId}/bulk-assign-horses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horseIds: selectedHorses }),
      });
      setMessage(`Đã thêm ${selectedHorses.length} ngựa thành công`);
      setSelectedHorses([]);
      loadRaceData();
    } catch (err) {
      setMessage("Lỗi thêm ngựa: " + err.message);
    }
  };

  const handleReleaseHorse = async (horseId) => {
    if (!window.confirm("Giải phóng ngựa này khỏi cuộc đua?")) return;

    try {
      await request(`/api/races/${raceId}/horses/${horseId}/release`, {
        method: "DELETE",
      });
      setMessage("Đã giải phóng ngựa thành công");
      loadRaceData();
    } catch (err) {
      setMessage("Lỗi giải phóng ngựa: " + err.message);
    }
  };

  const handleAssignReferees = async () => {
    if (selectedReferees.length === 0) {
      setMessage("Vui lòng chọn ít nhất 1 trọng tài");
      return;
    }

    try {
      await Promise.all(
        selectedReferees.map((refereeId) =>
          request(`/api/races/${raceId}/referees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refereeId }),
          })
        )
      );
      setMessage(`Đã mời ${selectedReferees.length} trọng tài`);
      setSelectedReferees([]);
      loadRaceData();
    } catch (err) {
      setMessage("Lỗi mời trọng tài: " + err.message);
    }
  };

  const handleStatusChange = async (action) => {
    try {
      await request(`/api/races/${raceId}/${action}`, {
        method: "POST",
      });
      setMessage(`Đã ${action} cuộc đua thành công`);
      loadRaceData();
    } catch (err) {
      setMessage(`Lỗi ${action}: ` + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  }

  if (!race) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Không tìm thấy cuộc đua
      </div>
    );
  }

  const status = race.status || race.Status;
  const statusLower = status?.toLowerCase();

  // State machine steps
  const stateSteps = [
    { key: "scheduled", label: "Đã lên lịch", date: race.scheduledAt },
    { key: "registrationopen", label: "Mở đăng ký" },
    { key: "registrationclosed", label: "Đóng đăng ký" },
    { key: "inprogress", label: "Đang diễn ra" },
    { key: "finished", label: "Đã kết thúc" },
  ];

  // Available actions based on status
  const actions = [];
  if (statusLower === "scheduled") {
    actions.push({
      label: "Mở đăng ký",
      onClick: () => handleStatusChange("open-registration"),
    });
  }
  if (statusLower === "registrationopen") {
    actions.push({
      label: "Đóng đăng ký",
      onClick: () => handleStatusChange("close-registration"),
    });
  }
  if (statusLower === "registrationclosed") {
    actions.push({
      label: "Bắt đầu cuộc đua",
      onClick: () => handleStatusChange("start"),
    });
  }
  if (statusLower === "inprogress") {
    actions.push({
      label: "Kết thúc cuộc đua",
      onClick: () => handleStatusChange("end"),
    });
  }

  return (
    <PageLayout
      breadcrumb={[
        { label: "Quản lý", to: "/admin" },
        { label: "Cuộc đua", to: "/admin/races" },
        { label: race.name || race.Name },
      ]}
      title={race.name || race.Name}
      subtitle={race.description || race.Description}
      primaryAction={
        actions.length > 0
          ? { label: actions[0].label, onClick: actions[0].onClick }
          : null
      }
    >
      {/* Message */}
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            background: message.startsWith("Lỗi")
              ? "rgba(239,68,68,0.1)"
              : "rgba(16,185,129,0.1)",
            color: message.startsWith("Lỗi") ? "#ef4444" : "#10b981",
            marginBottom: spacing.xl,
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner
        status={statusLower}
        title={race.name || race.Name}
        subtitle={`${race.location || race.Location || "Chưa có địa điểm"} · ${
          race.distance || race.Distance || 0
        }m`}
        meta={[
          {
            icon: "📅",
            text: new Date(race.scheduledAt || race.ScheduledAt).toLocaleString(
              "vi-VN"
            ),
          },
          {
            icon: "👥",
            text: `${assignedHorses.length} ngựa đã đăng ký`,
          },
          {
            icon: "🎯",
            text: `${selectedReferees.length} trọng tài`,
          },
        ]}
      />

      {/* State Stepper */}
      <StateStepper states={stateSteps} currentStatus={statusLower} />

      {/* Two Column Layout */}
      <TwoColumnLayout
        main={
          <>
            {/* Tabs */}
            <TabBar
              tabs={[
                { key: "horses", label: "Ngựa", count: assignedHorses.length },
                {
                  key: "referees",
                  label: "Trọng tài",
                  count: selectedReferees.length,
                },
                { key: "details", label: "Chi tiết" },
              ]}
              active={activeTab}
              onChange={setActiveTab}
            />

            {/* Horses Tab */}
            {activeTab === "horses" && (
              <div>
                {/* Multi-select Horses */}
                {statusLower === "scheduled" ||
                statusLower === "registrationopen" ? (
                  <div
                    style={{
                      padding: spacing.lg,
                      background: colors.cream,
                      borderRadius: "12px",
                      marginBottom: spacing.xl,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px",
                        fontSize: "18px",
                        color: colors.ink,
                      }}
                    >
                      Thêm ngựa vào cuộc đua
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "12px",
                        marginBottom: "16px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {availableHorses
                        .filter(
                          (h) =>
                            !assignedHorses.some(
                              (a) => (a.horseId || a.HorseId) === (h.id || h.Id)
                            )
                        )
                        .map((horse) => (
                          <label
                            key={horse.id || horse.Id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "12px",
                              background: selectedHorses.includes(
                                horse.id || horse.Id
                              )
                                ? colors.paper
                                : "transparent",
                              border: `2px solid ${
                                selectedHorses.includes(horse.id || horse.Id)
                                  ? colors.flame
                                  : colors.parchment
                              }`,
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedHorses.includes(
                                horse.id || horse.Id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedHorses([
                                    ...selectedHorses,
                                    horse.id || horse.Id,
                                  ]);
                                } else {
                                  setSelectedHorses(
                                    selectedHorses.filter(
                                      (id) => id !== (horse.id || horse.Id)
                                    )
                                  );
                                }
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: colors.ink,
                                }}
                              >
                                {horse.name || horse.Name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: colors.stone,
                                }}
                              >
                                {horse.breed || horse.Breed}
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    <Button
                      onClick={handleAssignHorses}
                      disabled={selectedHorses.length === 0}
                    >
                      Thêm {selectedHorses.length} ngựa đã chọn
                    </Button>
                  </div>
                ) : null}

                {/* Assigned Horses List */}
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: "18px",
                    color: colors.ink,
                  }}
                >
                  Ngựa đã đăng ký ({assignedHorses.length})
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {assignedHorses.map((entry) => (
                    <div
                      key={entry.id || entry.Id}
                      style={{
                        padding: "16px",
                        background: colors.paper,
                        border: `1px solid ${colors.parchment}`,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: colors.ink,
                          }}
                        >
                          {entry.horseName || entry.HorseName}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: colors.stone,
                            marginTop: "4px",
                          }}
                        >
                          Kỵ sĩ: {entry.jockeyName || entry.JockeyName || "Chưa có"}
                        </div>
                      </div>
                      {(statusLower === "scheduled" ||
                        statusLower === "registrationopen") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleReleaseHorse(entry.horseId || entry.HorseId)
                          }
                        >
                          Giải phóng
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Referees Tab */}
            {activeTab === "referees" && (
              <div>
                {/* Assign Referees */}
                {statusLower === "scheduled" ||
                statusLower === "registrationopen" ? (
                  <div
                    style={{
                      padding: spacing.lg,
                      background: colors.cream,
                      borderRadius: "12px",
                      marginBottom: spacing.xl,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 12px",
                        fontSize: "18px",
                        color: colors.ink,
                      }}
                    >
                      Mời trọng tài
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "12px",
                        marginBottom: "16px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {referees
                        .filter(
                          (r) =>
                            !selectedReferees.some(
                              (sr) => (sr.id || sr.Id) === (r.id || r.Id)
                            )
                        )
                        .map((referee) => (
                          <label
                            key={referee.id || referee.Id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "12px",
                              background: selectedReferees.includes(
                                referee.id || referee.Id
                              )
                                ? colors.paper
                                : "transparent",
                              border: `2px solid ${
                                selectedReferees.includes(
                                  referee.id || referee.Id
                                )
                                  ? colors.flame
                                  : colors.parchment
                              }`,
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedReferees.includes(
                                referee.id || referee.Id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedReferees([
                                    ...selectedReferees,
                                    referee.id || referee.Id,
                                  ]);
                                } else {
                                  setSelectedReferees(
                                    selectedReferees.filter(
                                      (id) => id !== (referee.id || referee.Id)
                                    )
                                  );
                                }
                              }}
                            />
                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: colors.ink,
                                }}
                              >
                                {referee.fullName || referee.FullName}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: colors.stone,
                                }}
                              >
                                {referee.experience || referee.Experience || 0} năm KN
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                    <Button
                      onClick={handleAssignReferees}
                      disabled={selectedReferees.length === 0}
                    >
                      Mời {selectedReferees.length} trọng tài đã chọn
                    </Button>
                  </div>
                ) : null}

                {/* Assigned Referees List */}
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: "18px",
                    color: colors.ink,
                  }}
                >
                  Trọng tài đã mời ({selectedReferees.length})
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {selectedReferees.map((referee) => (
                    <div
                      key={referee.id || referee.Id}
                      style={{
                        padding: "16px",
                        background: colors.paper,
                        border: `1px solid ${colors.parchment}`,
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: colors.ink,
                          }}
                        >
                          {referee.fullName || referee.FullName}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: colors.stone,
                            marginTop: "4px",
                          }}
                        >
                          Trạng thái:{" "}
                          <Badge
                            tone={
                              referee.status === "confirmed"
                                ? "success"
                                : referee.status === "declined"
                                ? "error"
                                : "warning"
                            }
                          >
                            {referee.status || "pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === "details" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: spacing.lg,
                }}
              >
                <div
                  style={{
                    padding: spacing.lg,
                    background: colors.paper,
                    border: `1px solid ${colors.parchment}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: colors.stone,
                      marginBottom: "4px",
                    }}
                  >
                    Khoảng cách
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: colors.ink,
                    }}
                  >
                    {race.distance || race.Distance || 0}m
                  </div>
                </div>
                <div
                  style={{
                    padding: spacing.lg,
                    background: colors.paper,
                    border: `1px solid ${colors.parchment}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: colors.stone,
                      marginBottom: "4px",
                    }}
                  >
                    Số ngựa tối đa
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: colors.ink,
                    }}
                  >
                    {race.maxParticipants || race.MaxParticipants || 0}
                  </div>
                </div>
                <div
                  style={{
                    padding: spacing.lg,
                    background: colors.paper,
                    border: `1px solid ${colors.parchment}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: colors.stone,
                      marginBottom: "4px",
                    }}
                  >
                    Thời gian bắt đầu
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: colors.ink,
                    }}
                  >
                    {new Date(
                      race.actualStartTime || race.ActualStartTime
                    ).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div
                  style={{
                    padding: spacing.lg,
                    background: colors.paper,
                    border: `1px solid ${colors.parchment}`,
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: colors.stone,
                      marginBottom: "4px",
                    }}
                  >
                    Thời gian kết thúc
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: colors.ink,
                    }}
                  >
                    {race.actualEndTime || race.ActualEndTime
                      ? new Date(
                          race.actualEndTime || race.ActualEndTime
                        ).toLocaleString("vi-VN")
                      : "Chưa kết thúc"}
                  </div>
                </div>
              </div>
            )}
          </>
        }
        sidebar={
          <div
            style={{
              display: "grid",
              gap: spacing.lg,
            }}
          >
            {/* Quick Stats */}
            <div
              style={{
                padding: spacing.lg,
                background: colors.paper,
                border: `1px solid ${colors.parchment}`,
                borderRadius: "12px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: "16px",
                  color: colors.ink,
                }}
              >
                Thống kê nhanh
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: colors.stone }}>Ngựa đã đăng ký:</span>
                  <strong style={{ color: colors.ink }}>
                    {assignedHorses.length}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: colors.stone }}>Trọng tài:</span>
                  <strong style={{ color: colors.ink }}>
                    {selectedReferees.length}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: colors.stone }}>Trạng thái:</span>
                  <StatusPill status={statusLower} size="sm" />
                </div>
              </div>
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div
                style={{
                  padding: spacing.lg,
                  background: colors.paper,
                  border: `1px solid ${colors.parchment}`,
                  borderRadius: "12px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "16px",
                    color: colors.ink,
                  }}
                >
                  Hành động
                </h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  {actions.map((action, idx) => (
                    <Button
                      key={idx}
                      onClick={action.onClick}
                      variant={idx === 0 ? "primary" : "secondary"}
                      fullWidth
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </PageLayout>
  );
}

export default RaceManagementPage;
