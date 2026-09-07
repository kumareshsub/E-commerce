import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context";

export default function Account() {
  const { user, setUser, notify } = useApp();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
  });

  if (!user) return <div className="container empty">Please login.</div>;

  const save = async (e) => {
    e.preventDefault();
    const updated = await api("/api/auth/me", { method: "PUT", body: JSON.stringify(form) });
    setUser(updated);
    notify("Profile updated");
  };

  return (
    <div className="container cart-layout">
      <form className="panel" onSubmit={save}>
        <h2>My account</h2>
        <p className="muted">Role: {user.role} · @{user.username}</p>
        {Object.keys(form).map((field) => (
          <div className="form-row" key={field}>
            <label>{field.replace("_", " ")}</label>
            <input value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </div>
        ))}
        <button className="btn btn-blue">Save profile</button>
      </form>
      <aside className="panel">
        <h3>Shortcuts</h3>
        <Link to="/orders">My orders</Link>
        <br />
        <Link to="/wishlist">Wishlist</Link>
        <br />
        <Link to="/cart">Cart</Link>
      </aside>
    </div>
  );
}
