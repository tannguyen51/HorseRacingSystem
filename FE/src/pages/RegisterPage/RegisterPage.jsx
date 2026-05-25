import "../AuthPage/AuthPage.css";

function RegisterPage() {
  return (
    <div className="auth-page">
      <section className="page-header">
        <h1>Register</h1>
        <p>Join RaceMaster and start following the season.</p>
      </section>
      <div className="auth-grid">
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
          <button className="primary-button">Register</button>
        </div>
        <div className="auth-card">
          <h3>Already have access?</h3>
          <p className="muted">Return to login to manage your account.</p>
          <button className="ghost-button">Go to Login</button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
