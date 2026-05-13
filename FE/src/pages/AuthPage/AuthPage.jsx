import "./AuthPage.css";

function AuthPage() {
  return (
    <div className="auth-page">
      <section className="page-header">
        <h1>Login / Register</h1>
        <p>Access your stable dashboard and tournament registrations.</p>
      </section>

      <div className="auth-grid">
        <div className="auth-card">
          <h3>Login</h3>
          <label>
            Email
            <input type="email" placeholder="you@stable.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button">Login</button>
        </div>
        <div className="auth-card">
          <h3>Create Account</h3>
          <label>
            Full Name
            <input type="text" placeholder="Ariana Blake" />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@stable.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="ghost-button">Register</button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
