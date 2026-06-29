import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authApi";
import {
  normalizeApiRole,
  ROLE_ID_BY_VALUE,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./RegisterPage.css";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        email,
        password,
        role: ROLE_ID_BY_VALUE.spectator,
        fullName: fullName.trim() || null,
      });
      const payload = unwrapResponseData(response);
      const apiRole = normalizeApiRole(payload?.role ?? payload?.Role);

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: apiRole || "spectator",
        })
      );
      setSuccessMessage("Tài khoản đã được tạo thành công.");
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <section className="page-header">
        <h1>Tham gia RaceMaster</h1>
        <p>Theo dõi các giải đua, bảng xếp hạng và cổ vũ cho ngựa yêu thích của bạn</p>
      </section>

      <div className="register-layout">
        <div className="single-card register-form-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Đăng ký người dùng </h2>
            <p className="auth-form__subtitle">
              Tài khoản miễn phí để theo dõi lịch đua, kết quả trực tiếp và bảng xếp hạng
            </p>

            <div className="form-group">
              <label htmlFor="fullname" className="label-required">
                Họ và tên
              </label>
              <input
                id="fullname"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Nhập họ và tên của bạn"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="label-required">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Địa chỉ E-mail"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label-required">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Mật khẩu"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="label-required">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirm-password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Xác nhận mật khẩu"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="terms-agreement">
              <label>
                <input type="checkbox" required />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="link-accent">Điều khoản dịch vụ</a>{" "}
                  và{" "}
                  <a href="#" className="link-accent">Chính sách bảo mật</a>
                </span>
              </label>
            </div>

            {errorMessage && <p className="form-error">{errorMessage}</p>}
            {successMessage && <p className="form-success">{successMessage}</p>}

            <button
              type="submit"
              className="primary-button btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>

            <p className="form-footer">
              Đã có tài khoản?{" "}
              <a href="/login" className="link-accent">Đăng nhập</a>
            </p>
          </form>
        </div>

        <div className="promo-cards">
          {/* ── Card 1: Chủ Ngựa ── */}
          <div className="promo-card promo-card--gold" onClick={() => navigate("/register/horse-owner")}>
            <div className="promo-card__inner">
              <div className="promo-card__body">
                <div className="promo-card__icon">
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                    <path d="M32 15c-1.5 2-3 4-4 6l-2-6-2 6c-1-2-2.5-4-4-6 0 4 1 8 2 12h8c1-4 2-8 2-12z" fill="#FFC83D" />
                    <circle cx="20" cy="13" r="2.5" fill="#FFC83D" />
                    <circle cx="28" cy="13" r="2.5" fill="#FFC83D" />
                    <path d="M17 34c0-2.5 3-5 7-5s7 2.5 7 5v3H17v-3z" fill="#FFC83D" opacity="0.5" />
                  </svg>
                </div>
                <h3 className="promo-card__title">Muốn ngựa của bạn được tranh tài trên đường đua?</h3>
                <p className="promo-card__desc">
                  Đăng ký tài khoản Chủ ngựa để quản lý ngựa và tham gia các giải đua.
                </p>
                <span className="promo-card__cta">
                  Đăng ký ngay
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3l5 5-5 5M13 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="promo-card__visual promo-card__visual--horse">
                <div
                  className="promo-card__art"
                  style={{ backgroundImage: "url('/images/promo/horse-owner-bg.jpg')" }}
                />
              </div>
            </div>
          </div>

          {/* ── Card 2: Kỵ Sĩ ── */}
          <div className="promo-card promo-card--blue" onClick={() => navigate("/register/jockey")}>
            <div className="promo-card__glow" />
            <div className="promo-card__inner">
              <div className="promo-card__body">
                <div className="promo-card__icon">
                  <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                    <path d="M15 32l3-12h12l3 12" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="24" cy="13" r="5" fill="#3B82F6" />
                    <path d="M18 25c2 4 4 6 6 6s4-2 6-6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <path d="M24 21v-3" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </div>
                <h3 className="promo-card__title">Muốn trở thành Kỵ sĩ?</h3>
                <p className="promo-card__desc">
                  Đăng ký để tham gia thi đấu và chinh phục những đường đua chuyên nghiệp.
                </p>
                <span className="promo-card__cta">
                  Đăng ký ngay
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3l5 5-5 5M13 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <div className="promo-card__visual promo-card__visual--jockey">
                <div
                  className="promo-card__art"
                  style={{ backgroundImage: "url('/images/promo/jockey-bg.jpg')" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
