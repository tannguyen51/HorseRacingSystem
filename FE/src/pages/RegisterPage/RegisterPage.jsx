import "./RegisterPage.css";

function RegisterPage() {
  return (
    <div className="auth-page">
      <section className="page-header">
        <h1>Register</h1>
        <p>Create your account and start entering tournaments today.</p>
      </section>

      <div className="auth-card single-card">
        <h3>Create a new account</h3>
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
    </div>
  );
}

export default RegisterPage;
