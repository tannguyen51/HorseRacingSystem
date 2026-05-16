import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoles, register } from "../../services/authApi";
import "./RegisterPage.css";

const DEFAULT_ROLES = [
  { value: "horse_owner", label: "Horse Owner" },
  { value: "jockey", label: "Jockey" },
  { value: "spectator", label: "Spectator" },
];

const ROLE_ID_BY_VALUE = {
  horse_owner: 1,
  jockey: 2,
  spectator: 3,
};

const ROLE_BY_API = {
  horseowner: "horse_owner",
  jockey: "jockey",
  spectator: "spectator",
  referee: "referee",
  admin: "admin",
};

const ROLE_BY_ID = {
  1: "horse_owner",
  2: "jockey",
  3: "spectator",
  4: "admin",
  5: "referee",
};

const LABEL_BY_ROLE = DEFAULT_ROLES.reduce((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {});

const normalizeApiRole = (value) => {
  if (value && typeof value === "object") {
    const nestedValue = value.value ?? value.name ?? value.role;
    if (nestedValue !== undefined) {
      return normalizeApiRole(nestedValue);
    }
  }

  if (typeof value === "number") {
    return ROLE_BY_ID[value] ?? "";
  }

  const key = String(value || "")
    .trim()
    .toLowerCase();
  if (!key) {
    return "";
  }

  if (/^\d+$/.test(key)) {
    return ROLE_BY_ID[Number(key)] ?? "";
  }

  return ROLE_BY_API[key] ?? "";
};

const unwrapResponseData = (response) => response?.data ?? response;

function RegisterPage() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState("horse_owner");
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
        const normalizedRoles = Array.isArray(apiRoles)
          ? apiRoles.map((role) => normalizeApiRole(role)).filter(Boolean)
          : [];
        const allowedRoles = normalizedRoles.filter(
          (role) => ROLE_ID_BY_VALUE[role],
        );
        const uniqueRoles = Array.from(new Set(allowedRoles));
        const roleOptions = uniqueRoles.map((value) => ({
          value,
          label: LABEL_BY_ROLE[value] ?? value,
        }));

        if (!cancelled && roleOptions.length > 0) {
          setRoles(roleOptions);
          if (!uniqueRoles.includes(selectedRole)) {
            setSelectedRole(uniqueRoles[0]);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setRoles(DEFAULT_ROLES);
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
  }, []);

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
      navigate("/");
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
            <label htmlFor="confirm-password" className="label-required">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
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
                placeholder="JCK-2026-001"
                className="form-input"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
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
