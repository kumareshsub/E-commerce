import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context";

export default function Register() {
  const { register, notify } = useApp();
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-side">
          <h2>Looks like you are new</h2>
          <p>Sign up to save your cart, wishlist and delivery address.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {error && <div className="error">{error}</div>}
          {["username", "email", "full_name", "phone", "password"].map((field) => (
            <div className="form-row" key={field}>
              <label>{field.replace("_", " ")}</label>
              <input
                type={field === "password" ? "password" : "text"}
                required={field !== "phone" && field !== "full_name"}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-blue btn-full">Register</button>
          <p style={{ marginTop: 14 }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
