import "../AuthPage/AuthPage.css";

function LoginPage() {
  return (
    <div className="auth-page">
      <section className="page-header">
        <h1>Login</h1>
        <p>Access your personalized RaceMaster workspace.</p>
      </section>
      <div className="auth-grid">
        <div className="auth-card">
          <h3>Welcome Back</h3>
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
          <h3>Need an account?</h3>
          <p className="muted">
            Create a new profile to manage your stable, races, and predictions.
          </p>
          <button className="ghost-button">Create Account</button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
