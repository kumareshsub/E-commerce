import { useEffect, useState } from "react";
import { api } from "../../api";
import { useApp } from "../../context";
import { Field, FormSection } from "./fields";

const labels = {
  store_name: "Store name",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp number",
  website: "Website",
  address: "Address",
};

export default function AdminSettings() {
  const { notify, site, setSite } = useApp();
  const [form, setForm] = useState(site);

  useEffect(() => {
    api("/api/admin/settings").then((data) => {
      setForm(data);
      setSite(data);
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(form) });
      setSite(data);
      notify("Contact settings saved");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Store settings</h2>
          <p className="admin-sub">These numbers power the Call, Email and Chat icons</p>
        </div>
        <span className="chip gold">Super admin only</span>
      </div>
      <form className="admin-card-form" onSubmit={save}>
        <div className="admin-card-form-head">
          <h3>Contact details</h3>
          <p>Customers use these when they tap the floating icons.</p>
        </div>
        <FormSection title="Store" cols={2}>
          {["store_name", "email", "phone", "whatsapp"].map((field) => (
            <Field key={field} label={labels[field]}>
              <input value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
            </Field>
          ))}
          <Field label={labels.website} wide>
            <input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </Field>
          <Field label={labels.address} wide>
            <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </FormSection>
        <div className="form-actions">
          <span className="muted">Phone and WhatsApp should include the country code.</span>
          <button className="btn btn-blue">Save settings</button>
        </div>
      </form>
    </>
  );
}
