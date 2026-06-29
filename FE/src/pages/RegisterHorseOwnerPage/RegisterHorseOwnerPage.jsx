import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authApi";
import {
  normalizeApiRole,
  ROLE_ID_BY_VALUE,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./RegisterHorseOwnerPage.css";

function RegisterHorseOwnerPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
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
        role: ROLE_ID_BY_VALUE.horse_owner,
        fullName: fullName.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      });
      const payload = unwrapResponseData(response);
      const apiRole = normalizeApiRole(payload?.role ?? payload?.Role);

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: apiRole || "horse_owner",
        })
      );
      setSuccessMessage("Tài khoản Chủ ngựa đã được tạo thành công.");
      navigate("/owner");
    } catch (error) {
      setErrorMessage(
        error.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-role-page">
      <section className="page-header">
        <div className="page-header__icon">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="rgba(143,100,32,0.1)" />
            <path d="M32 16c-1.5 2-3 4-4 6l-2-6-2 6c-1-2-2.5-4-4-6 0 4 1 8 2 12h8c1-4 2-8 2-12z" fill="#8f6420" />
            <circle cx="20" cy="14" r="2" fill="#8f6420" />
            <circle cx="28" cy="14" r="2" fill="#8f6420" />
            <path d="M18 36c0-2 2-4 6-4s6 2 6 4v2H18v-2z" fill="#8f6420" opacity="0.6" />
          </svg>
        </div>
        <h1>Đăng ký Chủ Ngựa</h1>
        <p>
          Muốn ngựa của bạn được tranh tài trên đường đua? Hãy đăng ký tài khoản
          Chủ ngựa để đưa ngựa của bạn tham gia các giải đua.
        </p>
      </section>

      <div className="single-card">
        <form className="auth-form" onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label htmlFor="phone" className="label-required">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Số điện thoại liên hệ"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="label-required">
              Địa chỉ
            </label>
            <input
              id="address"
              type="text"
              name="address"
              autoComplete="street-address"
              placeholder="Địa chỉ liên hệ"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
            {isSubmitting ? "Đang tạo..." : "Đăng ký Chủ Ngựa"}
          </button>

          <p className="form-footer">
            Đã có tài khoản?{" "}
            <a href="/login" className="link-accent">Đăng nhập</a>
          </p>
        </form>
      </div>

      <div className="register-role-links">
        <span>Bạn là Kỵ sĩ?</span>{" "}
        <Link to="/register/jockey" className="link-accent">Đăng ký Kỵ sĩ</Link>
        <span className="register-role-links__sep">|</span>
        <Link to="/register" className="link-accent">Đăng ký Khán giả</Link>
      </div>
    </div>
  );
}

export default RegisterHorseOwnerPage;
