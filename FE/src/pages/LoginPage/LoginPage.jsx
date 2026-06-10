import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoles, login } from "../../services/authApi";
import {
  buildLoginRoleOptions,
  LABEL_BY_ROLE,
  LOGIN_ROLE_OPTIONS,
  normalizeApiRole,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./LoginPage.css";

function LoginPage() {
  const [roles, setRoles] = useState(LOGIN_ROLE_OPTIONS);

  const [selectedRole, setSelectedRole] = useState("jockey");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rolesReady, setRolesReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const apiRolesResponse = await getRoles();
        const apiRoles = unwrapResponseData(apiRolesResponse);
        const roleOptions = buildLoginRoleOptions(apiRoles);
        const availableRoleValues = roleOptions.map((role) => role.value);

        if (!cancelled && roleOptions.length > 0) {
          setRoles(roleOptions);
          if (!availableRoleValues.includes(selectedRole)) {
            setSelectedRole(availableRoleValues[0]);
          }
        }
      } catch {
        if (!cancelled) {
          setRoles(LOGIN_ROLE_OPTIONS);
        }
      } finally {
        if (!cancelled) {
          setRolesReady(true);
        }
      }
    };

    loadRoles();
    return () => {
      cancelled = true;
    };
  }, [selectedRole]);

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

      if (apiRole !== selectedRole) {
        const selectedLabel = LABEL_BY_ROLE[selectedRole] ?? "selected";
        const apiLabel = LABEL_BY_ROLE[apiRole] ?? apiRole;
        throw new Error(
          `Role mismatch. Account is ${apiLabel}, not ${selectedLabel}.`,
        );
      }

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: apiRole,
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

      navigate(ROLE_ROUTES[apiRole] ?? "/");
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
              {roles.map((role) => (
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
            disabled={isSubmitting || !rolesReady}
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
