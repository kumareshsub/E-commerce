import { useEffect, useState } from "react";
import { api } from "../../api";
import { mailHref, telHref } from "../../contact";
import { useApp } from "../../context";
import { Field, FormSection } from "./fields";

export default function AdminUsers() {
  const { notify } = useApp();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "", role: "admin" });

  const load = () => api("/api/admin/users").then(setUsers);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ username: "", email: "", password: "", full_name: "", role: "admin" });
      load();
      notify("User created");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const patch = async (id, body) => {
    try {
      await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Users</h2>
          <p className="admin-sub">{users.length} accounts</p>
        </div>
        <span className="chip gold">Super admin only</span>
      </div>
      <form className="admin-card-form" onSubmit={create}>
        <div className="admin-card-form-head">
          <h3>Create an account</h3>
          <p>Add a store admin or a customer login.</p>
        </div>
        <FormSection title="Account" cols={2}>
          <Field label="Username">
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required placeholder="storeadmin" />
          </Field>
          <Field label="Full name">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Priya Kumar" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="name@email.com" />
          </Field>
          <Field label="Password">
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 8 characters" />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Store admin</option>
              <option value="customer">Customer</option>
            </select>
          </Field>
        </FormSection>
        <div className="form-actions">
          <span className="muted">Staff can manage catalogue. Customers can only shop.</span>
          <button className="btn btn-blue">Create user</button>
        </div>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="product-cell">
                    <strong>{u.username}</strong>
                    <small>{u.full_name || "—"}</small>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  {u.username === "superadmin" ? (
                    <span className="chip gold">superadmin</span>
                  ) : (
                    <select value={u.role} onChange={(e) => patch(u.id, { role: e.target.value })}>
                      <option>customer</option>
                      <option>admin</option>
                    </select>
                  )}
                </td>
                <td>
                  <a href={mailHref(u.email)} target="_blank" rel="noreferrer">Email</a>
                  {u.phone ? <> · <a href={telHref(u.phone)} target="_blank" rel="noreferrer">Call</a></> : null}
                </td>
                <td>
                  {u.username === "superadmin" ? "Active" : (
                    <button className="btn btn-ghost" onClick={() => patch(u.id, { is_active: !u.is_active })}>
                      {u.is_active ? "Disable" : "Enable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
