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
        throw new Error(`Unsupported role returned by server: ${rawRole}`);
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
          ? "Invalid email or password. Default admin: Admin@gmail.com / Admin123."
          : error.message || "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <section className="page-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your RaceMaster account to continue</p>
      </section>

      <div className="auth-card single-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>

          <div className="form-group">
            <label htmlFor="email" className="label-required">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@stable.com"
              className="form-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label-required">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
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
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

          <p className="form-footer">
            Don't have an account?{" "}
            <a href="/register" className="link-accent">
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
