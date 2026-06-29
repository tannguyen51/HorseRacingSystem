import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authApi";
import {
  normalizeApiRole,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      const payload = unwrapResponseData(response);
      const apiRole = normalizeApiRole(payload?.role ?? payload?.Role);

      if (!apiRole) {
        const rawRole = JSON.stringify(payload?.role ?? payload?.Role);
        throw new Error(`Vai trò không hợp lệ từ máy chủ: ${rawRole}`);
      }

      const normalizedRole = apiRole;

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: normalizedRole,
        }),
      );

      const ROLE_ROUTES = {
        spectator: "/spectator",
        jockey: "/jockey",
        horse_owner: "/owner",
        referee: "/referee",
        admin: "/admin",
        trainer: "/",
      };

      navigate(ROLE_ROUTES[normalizedRole] ?? "/");
    } catch (error) {
      setErrorMessage(
        error.status === 401
          ? "Email hoặc mật khẩu không đúng. Tài khoản admin mặc định: Admin@gmail.com / Admin123."
          : error.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <section className="page-header">
        <h1>Chào mừng trở lại</h1>
        <p>Đăng nhập vào tài khoản RaceMaster để tiếp tục</p>
      </section>

      <div className="auth-card single-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập</h2>

          <div className="form-group">
            <label htmlFor="email" className="label-required">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Nhập địa chỉ email của bạn"
              autoComplete="email"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              placeholder="Nhập mật khẩu của bạn"
              autoComplete="current-password"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button
            type="submit"
            className="primary-button btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="form-footer">
            Chưa có tài khoản?{" "}
            <a href="/register" className="link-accent">
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
