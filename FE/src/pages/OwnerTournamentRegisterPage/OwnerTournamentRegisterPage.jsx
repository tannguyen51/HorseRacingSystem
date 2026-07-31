import { useEffect, useMemo, useState } from "react";
import { getMyHorses } from "../../services/ownerHorseApi";
import { getOwnerTournaments } from "../../services/ownerApi";
import { request } from "../../services/apiClient";
import "../OwnerSharedLayout.css";
import "./OwnerTournamentRegisterPage.css";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa xác định"
    : new Intl.DateTimeFormat("vi-VN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const STATUS_LABEL = {
  Pending: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Từ chối",
};

const mapTournament = (tournament) => ({
  id: tournament?.id ?? tournament?.Id,
  name: tournament?.name ?? tournament?.Name ?? "Giải đấu",
  status: (tournament?.isActive ?? tournament?.IsActive) ? "Mở" : "Đã đóng",
  description:
    tournament?.description ?? tournament?.Description ?? "Không có mô tả.",
  date: formatDate(tournament?.startDate ?? tournament?.StartDate),
  raceCount: tournament?.raceCount ?? tournament?.RaceCount ?? 0,
});

function OwnerTournamentRegisterPage() {
  const [tournaments, setTournaments] = useState([]);
  const [horses, setHorses] = useState([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [isHorseLoading, setIsHorseLoading] = useState(true);
  const [horseError, setHorseError] = useState("");
  const [isTournamentLoading, setIsTournamentLoading] = useState(true);
  const [tournamentError, setTournamentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOwnerData = async () => {
      setIsHorseLoading(true);
      setIsTournamentLoading(true);
      setHorseError("");
      setTournamentError("");
      setMsg("");

      try {
        const data = await getMyHorses();
        const approvedHorses = (Array.isArray(data) ? data : []).filter(
          (horse) =>
            horse.approvalStatus === 2 || horse.approvalStatus === "Approved",
        );

        if (isMounted) {
          setHorses(approvedHorses);
          setSelectedHorseId(approvedHorses[0]?.id ?? "");
        }
      } catch (err) {
        if (isMounted) {
          setHorses([]);
          setSelectedHorseId("");
          setHorseError(err?.message || "Không thể tải danh sách ngựa đã duyệt.");
        }
      } finally {
        if (isMounted) setIsHorseLoading(false);
      }

      try {
        const data = await getOwnerTournaments();
        const openTournaments = (Array.isArray(data) ? data : [])
          .map(mapTournament)
          .filter((tournament) => tournament.status === "Mở");

        if (isMounted) {
          setTournaments(openTournaments);
          setSelectedTournamentId(openTournaments[0]?.id ?? "");
        }
      } catch (err) {
        if (isMounted) {
          setTournaments([]);
          setSelectedTournamentId("");
          setTournamentError(err?.message || "Không thể tải giải đấu đang mở.");
        }
      } finally {
        if (isMounted) setIsTournamentLoading(false);
      }

      try {
        const res = await request("/api/tournament-registrations/my");
        const data = res?.data ?? res;
        if (isMounted) {
          const list = Array.isArray(data) ? data : [];
          setRegistrations(
            list.map((entry) => ({
              id: entry.id ?? entry.Id ?? Date.now(),
              tournamentId: entry.tournamentId ?? entry.TournamentId,
              horseId: entry.horseId ?? entry.HorseId,
              horse: entry.horseName ?? entry.HorseName ?? "Không rõ",
              tournament:
                entry.tournamentName ?? entry.TournamentName ?? "Giải đấu",
              status:
                STATUS_LABEL[entry.status ?? entry.Status] ??
                entry.status ??
                entry.Status ??
                "Chờ duyệt",
              submitted: formatDate(entry.createdAt ?? entry.CreatedAt),
            })),
          );
        }
      } catch {
        if (isMounted) setRegistrations([]);
      }
    };

    fetchOwnerData();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedHorse = useMemo(
    () => horses.find((horse) => horse.id === selectedHorseId),
    [horses, selectedHorseId],
  );

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === selectedTournamentId),
    [selectedTournamentId, tournaments],
  );

  const hasExistingRegistration = useMemo(() => {
    if (!selectedHorseId || !selectedTournamentId) return false;
    return registrations.some(
      (registration) =>
        String(registration.horseId) === String(selectedHorseId) &&
        String(registration.tournamentId) === String(selectedTournamentId),
    );
  }, [registrations, selectedHorseId, selectedTournamentId]);

  const eligibilityChecks = [
    {
      label: "Duyệt ngựa",
      value: selectedHorse ? "Đã duyệt" : "Không có ngựa được chọn",
      tone: selectedHorse ? "success" : "warning",
    },
    {
      label: "Yêu cầu tuổi",
      value: selectedHorse?.age >= 3 ? "Đủ điều kiện" : "Quá trẻ",
      tone: selectedHorse?.age >= 3 ? "success" : "warning",
    },
    {
      label: "Thành tích đua",
      value: selectedHorse
        ? `${selectedHorse.totalWins ?? 0} trận thắng / ${selectedHorse.totalRaces ?? 0} cuộc đua`
        : "-",
      tone: selectedHorse ? "success" : "warning",
    },
    {
      label: "Giải đấu",
      value: selectedTournament
        ? `${selectedTournament.name} · ${selectedTournament.raceCount} cuộc đua`
        : "Không có giải đấu được chọn",
      tone: selectedTournament ? "success" : "warning",
    },
  ];

  const handleSubmitRegistration = async () => {
    if (!selectedHorse || !selectedTournament) return;
    setIsSubmitting(true);
    setMsg("");
    try {
      await request("/api/tournament-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: selectedTournament.id,
          horseId: selectedHorse.id,
        }),
      });
      setRegistrations((current) => [
        {
          id: Date.now(),
          tournamentId: selectedTournament.id,
          horseId: selectedHorse.id,
          horse: selectedHorse.name,
          tournament: selectedTournament.name,
          status: "Chờ duyệt",
          submitted: new Date().toISOString().slice(0, 10),
        },
        ...current,
      ]);
      setMsg("Đăng ký đã được gửi thành công! Admin sẽ duyệt ngựa của bạn.");
    } catch (err) {
      setMsg("Lỗi: " + (err?.message ?? "Không thể gửi đăng ký."));
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="owner-page owner-tournament-register">
      <div>
        <div className="owner-content">
          <section className="page-header">
            <h1>Đăng ký ngựa vào giải đấu</h1>
            <p>Chọn ngựa, kiểm tra điều kiện và theo dõi từng yêu cầu.</p>
          </section>

          <section className="register-grid">
            <form className="register-form">
              <div className="register-form__heading">
                <span className="pill">Đăng ký mới</span>
                <h2>Đăng ký giải đấu</h2>
                <p>Chỉ những ngựa đã được duyệt mới có thể đăng ký.</p>
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-horse">
                  Chọn ngựa
                </label>
                <select
                  id="select-horse"
                  className="form-select"
                  value={selectedHorseId}
                  onChange={(event) => setSelectedHorseId(event.target.value)}
                  disabled={isHorseLoading || horses.length === 0}
                >
                  {isHorseLoading ? (
                    <option value="">
                      Đang tải danh sách ngựa đã duyệt...
                    </option>
                  ) : horses.length === 0 ? (
                    <option value="">Không có ngựa đã duyệt nào</option>
                  ) : null}
                  {horses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} · Đã duyệt · {horse.age ?? "-"} tuổi
                    </option>
                  ))}
                </select>
                {horseError ? <p className="form-error">{horseError}</p> : null}
              </div>
              <div className="form-field">
                <label className="label-required" htmlFor="select-tournament">
                  Chọn giải đấu
                </label>
                <select
                  id="select-tournament"
                  className="form-select"
                  value={selectedTournamentId}
                  onChange={(event) =>
                    setSelectedTournamentId(event.target.value)
                  }
                  disabled={isTournamentLoading || tournaments.length === 0}
                >
                  {isTournamentLoading ? (
                    <option value="">Đang tải giải đấu đang mở...</option>
                  ) : tournaments.length === 0 ? (
                    <option value="">Không có giải đấu đang mở nào</option>
                  ) : null}
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} · {tournament.status}
                    </option>
                  ))}
                </select>
                {tournamentError ? (
                  <p className="form-error">{tournamentError}</p>
                ) : null}
              </div>
              <div className="selection-summary">
                <div>
                  <span>Ngựa</span>
                  <strong>
                    {selectedHorse?.name ?? "Không có ngựa đã duyệt"}
                  </strong>
                  <p>
                    {selectedHorse
                      ? `${selectedHorse.age ?? "-"} tuổi · ${selectedHorse.totalWins ?? 0} trận thắng / ${selectedHorse.totalRaces ?? 0} cuộc đua`
                      : "Cần có ngựa đã được duyệt."}
                  </p>
                </div>
                <div>
                  <span>Giải đấu</span>
                  <strong>
                    {selectedTournament?.name ?? "Không có giải đấu đang mở"}
                  </strong>
                  <p>
                    {selectedTournament
                      ? `${selectedTournament.description} · ${selectedTournament.date}`
                      : "Cần có giải đấu đang mở."}
                  </p>
                </div>
              </div>
              <div className="register-actions">
                {msg && (
                  <p
                    className={
                      msg.startsWith("Lỗi") ? "form-error" : "form-success"
                    }
                  >
                    {msg}
                  </p>
                )}
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  disabled={
                    !selectedHorse ||
                    !selectedTournament ||
                    isSubmitting ||
                    hasExistingRegistration
                  }
                >
                  {isSubmitting
                    ? "Đang gửi..."
                    : hasExistingRegistration
                      ? "Đã đăng ký"
                      : "Xem lại đăng ký"}
                </button>
                {hasExistingRegistration && (
                  <p className="form-error">
                    Ngựa này đã được đăng ký cho giải đấu đã chọn.
                  </p>
                )}
              </div>
            </form>

            <div className="eligibility-card">
              <div className="section-heading">
                <h2>Kiểm tra điều kiện</h2>
                <p>Xem trước cho lựa chọn hiện tại.</p>
              </div>
              <div className="eligibility-list">
                {eligibilityChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`eligibility-item eligibility-item--${check.tone}`}
                  >
                    <span>{check.label}</span>
                    <strong>{check.value}</strong>
                  </div>
                ))}
              </div>
              <div className="eligibility-note">
                <h4>Nhắc nhở</h4>
                <p className="muted">
                  Sau khi được admin duyệt, ngựa của bạn có thể được chọn vào
                  các cuộc đua trong giải.
                </p>
              </div>
            </div>
          </section>

          <section className="registration-status">
            <div className="section-heading">
              <h2>Trạng thái đăng ký</h2>
              <p>Theo dõi yêu cầu giải đấu đã gửi từ chuồng ngựa.</p>
            </div>
            <div className="registration-table">
              {registrations.length === 0 ? (
                <p className="muted">Chưa có đăng ký nào.</p>
              ) : (
                registrations.map((registration) => (
                  <article key={registration.id} className="registration-row">
                    <div>
                      <span>Ngựa</span>
                      <strong>{registration.horse}</strong>
                    </div>
                    <div>
                      <span>Giải đấu</span>
                      <strong>{registration.tournament}</strong>
                    </div>
                    <div>
                      <span>Đã gửi</span>
                      <strong>{registration.submitted}</strong>
                    </div>
                    <div>
                      <span>Trạng thái</span>
                      <strong
                        className={`registration-status-pill registration-status-pill--${registration.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {registration.status}
                      </strong>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {showConfirm ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-modal-title"
        >
          <div className="owner-modal">
            <div className="modal-header">
              <div>
                <span className="badge">Sẵn sàng gửi</span>
                <h3 id="register-modal-title">Xác nhận đăng ký</h3>
                <p className="muted">Xem lại trước khi gửi đăng ký.</p>
              </div>
              <button
                className="ghost-button"
                onClick={() => setShowConfirm(false)}
              >
                Đóng
              </button>
            </div>
            <div className="modal-body">
              <div>
                <h4>Ngựa</h4>
                <p>{selectedHorse?.name}</p>
              </div>
              <div>
                <h4>Giải đấu</h4>
                <p>{selectedTournament?.name}</p>
              </div>
              <div>
                <h4>Mô tả</h4>
                <p>{selectedTournament?.description}</p>
              </div>
              <div>
                <h4>Cuộc đua trong giải</h4>
                <p>{selectedTournament?.raceCount} đã lên lịch</p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="ghost-button"
                onClick={() => setShowConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="primary-button"
                onClick={handleSubmitRegistration}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : "Xác nhận gửi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OwnerTournamentRegisterPage;
