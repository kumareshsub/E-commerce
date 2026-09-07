import { useEffect, useState } from "react";
import { api } from "../../api";
import { useApp } from "../../context";
import { Field, FormSection } from "./fields";

const empty = { name: "", slug: "", image: "", description: "", icon: "sports", status: true };

export default function AdminCategories() {
  const { notify, isSuper } = useApp();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api("/api/admin/categories").then(setItems);
  useEffect(() => { load(); }, []);

  const reset = () => {
    setForm(empty);
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    try {
      if (editing) await api(`/api/admin/categories/${editing}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/admin/categories", { method: "POST", body: JSON.stringify(payload) });
      reset();
      load();
      notify("Category saved");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Categories</h2>
          <p className="admin-sub">{items.length} sport groups</p>
        </div>
        {!isSuper && <span className="chip">Delete is super admin only</span>}
      </div>
      <form className="admin-card-form" onSubmit={submit}>
        <div className="admin-card-form-head">
          <h3>{editing ? "Edit category" : "Add a category"}</h3>
          <p>These show in the shop navigation and on the home page.</p>
        </div>
        <FormSection title="Details" cols={2}>
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Running" />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" />
          </Field>
          <Field label="Image URL" wide>
            <div className="image-field-row">
              {form.image ? <img className="image-preview" src={form.image} alt="" /> : <div className="image-preview placeholder">Preview</div>}
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
          </Field>
          <Field label="Description" wide>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short line for this sport" />
          </Field>
        </FormSection>
        <div className="form-actions">
          <label className="check"><input type="checkbox" checked={form.status} onChange={(e) => setForm({ ...form, status: e.target.checked })} /> Visible in shop</label>
          <div className="form-actions-right">
            {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
            <button className="btn btn-blue">{editing ? "Save changes" : "Add category"}</button>
          </div>
        </div>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th></th><th>Name</th><th>Slug</th><th></th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.image ? <img className="table-img" src={c.image} alt="" /> : null}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.slug}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost" onClick={() => { setEditing(c.id); setForm(c); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                    {isSuper && (
                      <button className="btn btn-ghost" onClick={async () => { await api(`/api/admin/categories/${c.id}`, { method: "DELETE" }); load(); }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
