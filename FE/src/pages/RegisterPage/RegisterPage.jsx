import { useState } from "react";
import "./RegisterPage.css";

const ROLES = [
  { value: "horse_owner", label: "Horse Owner" },
  { value: "jockey", label: "Jockey" },
  { value: "spectator", label: "Spectator" },
  { value: "referee", label: "Referee" },
  { value: "admin", label: "Admin" },
];

function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState("horse_owner");

  return (
    <div className="auth-page register-page">
      <section className="page-header">
        <h1>Join RaceMaster</h1>
        <p>Create your account and start competing in tournaments today</p>
      </section>

      <div className="auth-card single-card">
        <form className="auth-form">
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
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

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

          <button type="submit" className="primary-button btn-block">
            Create Account
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
