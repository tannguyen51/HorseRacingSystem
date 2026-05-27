import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoles, register } from "../../services/authApi";
import {
  buildRegisterRoleOptions,
  normalizeApiRole,
  REGISTER_ROLE_OPTIONS,
  ROLE_ID_BY_VALUE,
  unwrapResponseData,
} from "../../services/authRoleUtils";
import "./RegisterPage.css";

function RegisterPage() {
  const [roles, setRoles] = useState(REGISTER_ROLE_OPTIONS);

  const [selectedRole, setSelectedRole] = useState("jockey");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rolesReady, setRolesReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const apiRolesResponse = await getRoles();
        const apiRoles = unwrapResponseData(apiRolesResponse);
        const roleOptions = buildRegisterRoleOptions(apiRoles);
        const availableRoleValues = roleOptions.map((role) => role.value);

        if (!cancelled && roleOptions.length > 0) {
          setRoles(roleOptions);
          if (!availableRoleValues.includes(selectedRole)) {
            setSelectedRole(availableRoleValues[0]);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setRoles(REGISTER_ROLE_OPTIONS);
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
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const roleValue = ROLE_ID_BY_VALUE[selectedRole];
    if (!roleValue) {
      setErrorMessage("Unsupported role selected.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        email,
        password,
        role: roleValue,
        fullName: fullName.trim() || null,
        licenseNumber:
          selectedRole === "jockey" ? licenseNumber.trim() || null : null,
      });
      const payload = unwrapResponseData(response);
      const apiRole = normalizeApiRole(payload?.role ?? payload?.Role);

      localStorage.setItem("authToken", payload?.token ?? "");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          userId: payload?.userId,
          email: payload?.email,
          role: apiRole || selectedRole,
        }),
      );
      setSuccessMessage("Account created successfully.");

      if ((apiRole || selectedRole) === "jockey") {
        navigate("/jockey/invitations");
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(
        error.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <section className="page-header">
        <h1>Join RaceMaster</h1>
        <p>Create your account and start competing in tournaments today</p>
      </section>

      <div className="auth-card single-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>

          <div className="form-group">
            <label htmlFor="fullname" className="label-required">
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Ariana Blake"
              className="form-input"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

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
              autoComplete="new-password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="label-required">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              className="form-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="label-required">
              Register As
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

          {selectedRole === "jockey" ? (
            <div className="form-group">
              <label htmlFor="license" className="label-required">
                License Number
              </label>
              <input
                id="license"
                type="text"
                name="license"
                placeholder="JCK-2026-001"
                className="form-input"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="terms-agreement">
            <label>
              <input type="checkbox" required />
              <span>
                I agree to the{" "}
                <a href="#" className="link-accent">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="link-accent">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="form-success">{successMessage}</p>
          ) : null}

          <button
            type="submit"
            className="primary-button btn-block"
            disabled={isSubmitting || !rolesReady}
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>

          <p className="form-footer">
            Already have an account?{" "}
            <a href="/login" className="link-accent">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
