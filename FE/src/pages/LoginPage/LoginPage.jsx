import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authApi";
import "./LoginPage.css";

const ROLES = [
  { value: "horse_owner", label: "Horse Owner" },
  { value: "jockey", label: "Jockey" },
  { value: "spectator", label: "Spectator" },
  { value: "referee", label: "Referee" },
  { value: "admin", label: "Admin" },
];

function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("horse_owner");
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
      localStorage.setItem("authToken", response.token);
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: response.userId,
          email: response.email,
          role: response.role,
        }),
      );
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
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
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="label-required">
              Login As
            </label>
            <select
              id="role"
              className="form-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
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
