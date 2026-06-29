import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyHorses,
  inviteJockeyToHorse,
} from "../../services/ownerHorseApi";
import { getAvailableJockeys } from "../../services/jockeyApi";
import "../OwnerSharedLayout.css";
import "./OwnerHorseListPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5226";
const getImageUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const statusFilters = ["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"];
const approvalStatusMap = {
  1: "Chờ duyệt",
  2: "Đã duyệt",
  3: "Từ chối",
};

const invitationStatusMap = {
  1: "Chờ duyệt",
  2: "Đã chấp nhận",
  3: "Từ chối",
};

const getInvitationStatus = (invitation) => {
  const status = invitation?.status ?? invitation?.Status;
  return typeof status === "number"
    ? invitationStatusMap[status] ?? "Chờ duyệt"
    : status || "Chờ duyệt";
};

const getJockeyName = (invitation) =>
  invitation?.jockey?.user?.fullName ??
  invitation?.Jockey?.User?.FullName ??
  invitation?.jockey?.user?.FullName ??
  invitation?.Jockey?.user?.fullName ??
  "Kỵ sĩ đã chọn";

const getHorseAssignment = (horse) => {
  const invitations = horse?.jockeyInvitations ?? horse?.JockeyInvitations ?? [];
  const activeInvitation = invitations.find((invitation) => {
    const status = getInvitationStatus(invitation).toLowerCase();
    return status === "chờ duyệt" || status === "đã chấp nhận";
  });

  if (activeInvitation) {
    const status = getInvitationStatus(activeInvitation);
    return {
      jockeyName: getJockeyName(activeInvitation),
      status,
      isLocked: true,
      label: status === "Đã chấp nhận" ? "Đã chỉ định" : "Chờ duyệt",
    };
  }

  if (horse?.assignedJockeyName) {
    return {
      jockeyName: horse.assignedJockeyName,
      status: horse.jockeyInvitationStatus || "Chờ duyệt",
      isLocked: true,
      label: horse.jockeyInvitationStatus || "Chờ duyệt",
    };
  }

  return null;
};

function OwnerHorseListPage() {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [jockeys, setJockeys] = useState([]);
  const [isJockeyLoading, setIsJockeyLoading] = useState(false);
  const [jockeyError, setJockeyError] = useState("");
  const [assignHorse, setAssignHorse] = useState(null);
  const [selectedJockeyId, setSelectedJockeyId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");

  const fetchJockeys = async () => {
    setIsJockeyLoading(true);
    setJockeyError("");

    try {
      const list = await getAvailableJockeys();
      setJockeys(list);
      setSelectedJockeyId((current) => current || list[0]?.id || "");

      if (list.length === 0) {
        setJockeyError(
          "API trả về 0 kỵ sĩ. Vui lòng kiểm tra xem có tài khoản kỵ sĩ trong bảng Jockeys không.",
        );
      }
    } catch (fetchError) {
      const statusPrefix = fetchError?.status ? `HTTP ${fetchError.status}: ` : "";
      setJockeys([]);
      setJockeyError(
        `${statusPrefix}${fetchError?.message || "Không thể tải danh sách kỵ sĩ."}`,
      );
    } finally {
      setIsJockeyLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHorses = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getMyHorses();
        if (isMounted) {
          setHorses(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError?.message || "Không thể tải danh sách ngựa.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHorses();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchJockeys();
  }, []);

  const getStatusLabel = (horse) =>
    approvalStatusMap[horse.approvalStatus] ?? "Chờ duyệt";

  const totalCount = horses.length;
  const pendingCount = horses.filter(
    (horse) => getStatusLabel(horse) === "Chờ duyệt",
  ).length;

  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      const horseStatus = getStatusLabel(horse);
      const matchesStatus =
        status === "Tất cả" || horseStatus.toLowerCase() === status.toLowerCase();
      const matchesQuery = horse.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, status, horses]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredHorses.length / pageSize));
  const pageItems = filteredHorses.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const selectedJockey = jockeys.find((jockey) => jockey.id === selectedJockeyId);

  const openAssignModal = (horse = pageItems[0]) => {
    if (!horse) {
      return;
    }

    if (getHorseAssignment(horse)?.isLocked) {
      return;
    }

    setAssignHorse(horse);
    setAssignMessage("");
    setSelectedJockeyId((current) => current || jockeys[0]?.id || "");
    fetchJockeys();
  };

  const closeAssignModal = () => {
    if (isAssigning) {
      return;
    }

    setAssignHorse(null);
    setAssignMessage("");
  };

  const handleAssignJockey = async () => {
    if (!assignHorse || !selectedJockeyId) {
      setJockeyError("Vui lòng chọn kỵ sĩ.");
      return;
    }

    setIsAssigning(true);
    setJockeyError("");
    setAssignMessage("");

    try {
      await inviteJockeyToHorse(assignHorse.id, {
        jockeyId: selectedJockeyId,
      });

      const jockeyName = selectedJockey?.fullName || "Kỵ sĩ đã chọn";
      setHorses((current) =>
        current.map((horse) =>
          horse.id === assignHorse.id
            ? {
                ...horse,
                assignedJockeyName: jockeyName,
                jockeyInvitationStatus: "Chờ duyệt",
              }
            : horse,
        ),
      );
      setAssignMessage(`Đã gửi lời mời đến ${jockeyName}.`);
    } catch (assignError) {
      setJockeyError(assignError?.message || "Không thể chỉ định kỵ sĩ.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="owner-page owner-horse-list">
      <div className="owner-layout">
        <aside className="owner-sidebar">
          <div className="owner-sidebar__header">
            <p className="pill">Chủ Ngựa</p>
            <h3>Quản lý ngựa</h3>
            <p className="muted">Tìm kiếm, chỉnh sửa và theo dõi chuồng ngựa.</p>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Tổng số ngựa</p>
            <h4>{totalCount}</h4>
            <span>Trong chuồng ngựa</span>
          </div>
          <div className="owner-sidebar__card">
            <p className="muted">Chờ phê duyệt</p>
            <h4>{pendingCount}</h4>
            <span>Đang chờ xét duyệt</span>
          </div>
        </aside>

        <div className="owner-content">
          <section className="page-header">
            <h1>Danh sách ngựa</h1>
            <p>Quản lý hồ sơ ngựa và đăng ký sắp tới.</p>
          </section>

          <section className="owner-actions">
            <Link className="primary-button" to="/owner/horses/new">
              Tạo ngựa mới
            </Link>
          </section>

          <section className="owner-filters">
            <div className="filter-group">
              <label htmlFor="horse-search" className="label-required">
                Tìm kiếm ngựa
              </label>
              <input
                id="horse-search"
                className="form-input"
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên ngựa"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="horse-status" className="label-required">
                Trạng thái
              </label>
              <select
                id="horse-status"
                className="form-select"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                {statusFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {error ? <p className="form-error">{error}</p> : null}

          <section className="horse-grid">
            {isLoading ? (
              <p className="muted">Đang tải danh sách ngựa...</p>
            ) : (
              pageItems.map((horse) => {
                const statusLabel = getStatusLabel(horse);
                const assignment = getHorseAssignment(horse);
                const imageUrl = getImageUrl(horse.imageUrl ?? horse.ImageUrl);
                const imageStyle = imageUrl
                  ? { "--horse-image": `url(${imageUrl})` }
                  : undefined;
                return (
                  <article key={horse.id} className="horse-card hover-lift">
                    <div className="horse-media">
                      <div
                        className="horse-image"
                        style={imageStyle}
                        aria-hidden="true"
                      />
                      <span
                        className={`horse-status badge badge-${statusLabel.toLowerCase()}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="horse-card__content">
                      <div className="horse-card__header">
                        <h3>{horse.name}</h3>
                        <p className="muted">
                          {horse.breed || "Không rõ giống"}
                          {horse.color ? ` • ${horse.color}` : ""}
                        </p>
                        {assignment ? (
                          <span className="horse-card__jockey">
                            {assignment.jockeyName} · {assignment.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="horse-card__details">
                        <div>
                          <span>Tuổi</span>
                          <strong>{horse.age ?? "-"}</strong>
                        </div>
                        <div>
                          <span>Giới tính</span>
                          <strong>{horse.gender || "-"}</strong>
                        </div>
                        <div>
                          <span>Tổng số trận thắng</span>
                          <strong>{horse.totalWins ?? 0}</strong>
                        </div>
                        <div>
                          <span>Tổng số cuộc đua</span>
                          <strong>{horse.totalRaces ?? 0}</strong>
                        </div>
                      </div>
                      <div className="horse-card__actions">
                        <Link
                          className="horse-action horse-action--primary"
                          to={`/owner/horses/${horse.id}`}
                        >
                          Xem chi tiết
                        </Link>
                        <div className="horse-card__secondary-actions">
                          <Link
                            className="horse-action horse-action--edit"
                            to={`/owner/horses/${horse.id}/edit`}
                          >
                            Chỉnh sửa
                          </Link>
                          <button
                            type="button"
                            className={`horse-action horse-action--assign ${
                              assignment?.isLocked ? "horse-action--locked" : ""
                            }`}
                            onClick={() => openAssignModal(horse)}
                            disabled={assignment?.isLocked}
                          >
                            {assignment?.isLocked ? "Đã chỉ định kỵ sĩ" : "Chỉ định kỵ sĩ"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <section className="pagination">
            <button
              className="ghost-button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <span>
              Trang {page} / {pageCount}
            </span>
            <button
              className="ghost-button"
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
            >
              Sau
            </button>
          </section>
        </div>
      </div>

      {assignHorse ? (
        <div
          className="assign-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-jockey-title"
        >
          <div className="assign-modal">
            <div className="assign-modal__header">
              <div>
                <span className="pill">Chỉ định kỵ sĩ</span>
                <h3 id="assign-jockey-title">{assignHorse.name}</h3>
              </div>
              <button
                className="assign-modal__close"
                type="button"
                onClick={closeAssignModal}
                aria-label="Đóng hộp thoại chỉ định kỵ sĩ"
              >
                ×
              </button>
            </div>

            <div className="assign-modal__body">
              {isJockeyLoading ? (
                <p className="muted">Đang tải danh sách kỵ sĩ...</p>
              ) : jockeyError && jockeys.length === 0 ? (
                <div className="assign-empty">
                  <h4>Không thể hiển thị kỵ sĩ</h4>
                  <p className="muted">{jockeyError}</p>
                </div>
              ) : jockeys.length === 0 ? (
                <div className="assign-empty">
                  <h4>Không có kỵ sĩ nào</h4>
                  <p className="muted">
                    Tài khoản kỵ sĩ từ API sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <>
                  <label className="label-required" htmlFor="assign-jockey">
                    Kỵ sĩ khả dụng
                  </label>
                  <select
                    id="assign-jockey"
                    className="form-select"
                    value={selectedJockeyId}
                    onChange={(event) => setSelectedJockeyId(event.target.value)}
                  >
                    {jockeys.map((jockey) => (
                      <option key={jockey.id} value={jockey.id}>
                        {jockey.fullName} ·{" "}
                        {jockey.approvalStatusName || "Không rõ"} ·{" "}
                        {jockey.winRate ?? 0}% tỷ lệ thắng
                      </option>
                    ))}
                  </select>

                  {selectedJockey ? (
                    <div className="jockey-preview">
                      <div className="jockey-preview__avatar">
                        {selectedJockey.fullName?.slice(0, 1) || "J"}
                      </div>
                      <div>
                        <h4>{selectedJockey.fullName}</h4>
                        <p className="muted">
                          Giấy phép {selectedJockey.licenseNumber || "N/A"} ·{" "}
                          {selectedJockey.nationality || "Không rõ quốc tịch"}
                        </p>
                      </div>
                      <div className="jockey-preview__stats">
                        <span>{selectedJockey.approvalStatusName || "Không rõ"}</span>
                        <span>{selectedJockey.totalWins ?? 0} trận thắng</span>
                        <span>{selectedJockey.totalRaces ?? 0} cuộc đua</span>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {jockeyError && jockeys.length > 0 ? (
                <p className="form-error">{jockeyError}</p>
              ) : null}
              {assignMessage ? (
                <p className="assign-success">{assignMessage}</p>
              ) : null}
            </div>

            <div className="assign-modal__actions">
              <button
                className="horse-action horse-action--assign"
                type="button"
                onClick={handleAssignJockey}
                disabled={isAssigning || isJockeyLoading || jockeys.length === 0}
              >
                {isAssigning ? "Đang gửi..." : "Gửi lời mời"}
              </button>
              <button
                className="horse-action horse-action--edit"
                type="button"
                onClick={closeAssignModal}
                disabled={isAssigning}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OwnerHorseListPage;
