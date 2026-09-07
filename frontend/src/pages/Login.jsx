import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context";

export default function Login() {
  const { login, notify } = useApp();
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("Demo@123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(username, password);
      navigate(user.role === "customer" ? "/" : "/admin");
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-side">
          <h2>Login</h2>
          <p>Get access to your orders, wishlist and sports recommendations.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          <div className="form-row">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-blue btn-full">Login</button>
          <p style={{ marginTop: 14 }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
          <div className="hint">
            <strong>Demo logins</strong><br />
            Super admin: superadmin / SuperAdmin@123 — users, refunds, settings<br />
            Admin: admin / Admin@123 — products and orders only<br />
            Customer: demo / Demo@123
          </div>
        </form>
      </div>
    </div>
  );
}
