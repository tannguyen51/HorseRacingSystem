import "./LoginPage.css";

function LoginPage() {
  return (
    <div className="auth-page">
      <section className="page-header">
        <h1>Login</h1>
        <p>Sign in to manage your races, view standings, and join tournaments.</p>
      </section>

      <div className="auth-card single-card">
        <h3>Login to your account</h3>
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
    </div>
  );
}

export default LoginPage;
