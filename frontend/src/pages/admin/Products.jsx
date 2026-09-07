import { useEffect, useState } from "react";
import { api, asList } from "../../api";
import { useApp } from "../../context";
import { Field, FormSection } from "./fields";

const empty = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  image: "",
  quantity: 20,
  original_price: 999,
  selling_price: 699,
  description: "",
  trending: false,
  status: true,
  category_id: "",
  color: "",
  size: "",
  material: "",
  length_cm: 0,
  width_cm: 0,
  height_cm: 0,
  weight_g: 0,
  gender: "unisex",
  highlights: "",
  features: "",
  warranty_months: 6,
  country_of_origin: "India",
  care_instructions: "",
  suitable_for: "",
};

export default function AdminProducts() {
  const { notify, isSuper } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = async (nextPage = page) => {
    const query = new URLSearchParams({ page: String(nextPage), limit: "20" });
    if (q) query.set("q", q);
    const data = await api(`/api/admin/products?${query.toString()}`);
    setProducts(asList(data));
    setTotal(Array.isArray(data) ? data.length : data.total || 0);
    setPages(Array.isArray(data) ? 1 : data.pages || 1);
    setPage(Array.isArray(data) ? 1 : data.page || nextPage);
    setCategories(await api("/api/admin/categories"));
  };
  useEffect(() => { load(1); }, []);

  const reset = () => {
    setForm({ ...empty, category_id: categories[0]?.id || "" });
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      category_id: Number(form.category_id),
      quantity: Number(form.quantity),
      original_price: Number(form.original_price),
      selling_price: Number(form.selling_price),
      length_cm: Number(form.length_cm || 0),
      width_cm: Number(form.width_cm || 0),
      height_cm: Number(form.height_cm || 0),
      weight_g: Number(form.weight_g || 0),
      warranty_months: Number(form.warranty_months || 0),
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      features: JSON.stringify(
        String(form.features || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    };
    try {
      if (editing) await api(`/api/admin/products/${editing}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
      reset();
      await load(1);
      notify("Product saved");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku || "",
      brand: p.brand,
      image: p.image,
      quantity: p.quantity,
      original_price: p.original_price,
      selling_price: p.selling_price,
      description: p.description,
      trending: p.trending,
      status: p.status,
      category_id: p.category_id,
      color: p.color || "",
      size: p.size || "",
      material: p.material || "",
      length_cm: p.length_cm || 0,
      width_cm: p.width_cm || 0,
      height_cm: p.height_cm || 0,
      weight_g: p.weight_g || 0,
      gender: p.gender || "unisex",
      highlights: p.highlights || "",
      features: Array.isArray(p.features) ? p.features.join(", ") : "",
      warranty_months: p.warranty_months || 6,
      country_of_origin: p.country_of_origin || "India",
      care_instructions: p.care_instructions || "",
      suitable_for: p.suitable_for || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Products</h2>
          <p className="admin-sub">{total} items in catalogue</p>
        </div>
        {!isSuper && <span className="chip">Admin can add/edit. Super admin deletes.</span>}
      </div>

      <form className="admin-card-form" onSubmit={submit}>
        <div className="admin-card-form-head">
          <h3>{editing ? "Edit product" : "Add a product"}</h3>
          <p>{editing ? "Update this listing and save changes." : "Fill in the details below, then add it to the shop."}</p>
        </div>

        <FormSection title="Basic details" cols={3}>
          <Field label="Name">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Adidas running shoes" />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" />
          </Field>
          <Field label="SKU">
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="BD-1001" />
          </Field>
          <Field label="Brand">
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} required placeholder="Nike" />
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </Field>
          <Field label="Image URL" wide>
            <div className="image-field-row">
              {form.image ? <img className="image-preview" src={form.image} alt="" /> : <div className="image-preview placeholder">Preview</div>}
              <input value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://..." />
            </div>
          </Field>
        </FormSection>

        <FormSection title="Pricing & stock" cols={3}>
          <Field label="Quantity">
            <input type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
          </Field>
          <Field label="MRP (₹)">
            <input type="number" value={form.original_price} onChange={(e) => set("original_price", e.target.value)} />
          </Field>
          <Field label="Selling price (₹)">
            <input type="number" value={form.selling_price} onChange={(e) => set("selling_price", e.target.value)} />
          </Field>
        </FormSection>

        <FormSection title="Variant" cols={3}>
          <Field label="Colour">
            <input value={form.color} onChange={(e) => set("color", e.target.value)} placeholder="Black" />
          </Field>
          <Field label="Size">
            <input value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="UK8 / L" />
          </Field>
          <Field label="Material">
            <input value={form.material} onChange={(e) => set("material", e.target.value)} placeholder="Mesh, leather" />
          </Field>
        </FormSection>

        <FormSection title="Dimensions" cols={4}>
          <Field label="Length (cm)">
            <input type="number" step="0.1" value={form.length_cm} onChange={(e) => set("length_cm", e.target.value)} />
          </Field>
          <Field label="Width (cm)">
            <input type="number" step="0.1" value={form.width_cm} onChange={(e) => set("width_cm", e.target.value)} />
          </Field>
          <Field label="Height (cm)">
            <input type="number" step="0.1" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
          </Field>
          <Field label="Weight (g)">
            <input type="number" value={form.weight_g} onChange={(e) => set("weight_g", e.target.value)} />
          </Field>
        </FormSection>

        <FormSection title="More info" cols={3}>
          <Field label="Warranty (months)">
            <input type="number" value={form.warranty_months} onChange={(e) => set("warranty_months", e.target.value)} />
          </Field>
          <Field label="Country of origin">
            <input value={form.country_of_origin} onChange={(e) => set("country_of_origin", e.target.value)} />
          </Field>
          <Field label="Suitable for">
            <input value={form.suitable_for} onChange={(e) => set("suitable_for", e.target.value)} placeholder="Trail running" />
          </Field>
          <Field label="Care instructions" wide>
            <input value={form.care_instructions} onChange={(e) => set("care_instructions", e.target.value)} placeholder="Wipe clean, air dry" />
          </Field>
        </FormSection>

        <FormSection title="Description">
          <Field label="Highlights" wide>
            <input value={form.highlights} onChange={(e) => set("highlights", e.target.value)} placeholder="Lightweight · cushioned heel" />
          </Field>
          <Field label="Features" wide>
            <input value={form.features} onChange={(e) => set("features", e.target.value)} placeholder="Comma separated, e.g. Breathable mesh, Rubber outsole" />
          </Field>
          <Field label="Full description" wide>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What the customer should know about this product" />
          </Field>
        </FormSection>

        <div className="form-actions">
          <div className="check-row">
            <label className="check"><input type="checkbox" checked={form.trending} onChange={(e) => set("trending", e.target.checked)} /> Trending</label>
            <label className="check"><input type="checkbox" checked={form.status} onChange={(e) => set("status", e.target.checked)} /> Visible in shop</label>
          </div>
          <div className="form-actions-right">
            {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
            <button className="btn btn-blue">{editing ? "Save changes" : "Add product"}</button>
          </div>
        </div>
      </form>

      <form className="admin-toolbar" onSubmit={(e) => { e.preventDefault(); load(1); }}>
        <input placeholder="Search name, SKU or brand" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-ghost" type="submit">Search</button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th></th><th>Product</th><th>SKU</th><th>Size / Colour</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img className="table-img" src={p.image} alt="" /></td>
                <td>
                  <div className="product-cell">
                    <strong>{p.name}</strong>
                    <small>{p.brand}</small>
                  </div>
                </td>
                <td>{p.sku}</td>
                <td>{[p.size, p.color].filter(Boolean).join(" · ") || "—"}</td>
                <td>₹{Math.round(p.selling_price)}</td>
                <td><span className={`stock-pill ${p.quantity < 8 ? "low" : ""}`}>{p.quantity}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost" onClick={() => edit(p)}>Edit</button>
                    {isSuper && (
                      <button className="btn btn-ghost" onClick={async () => { await api(`/api/admin/products/${p.id}`, { method: "DELETE" }); load(page); }}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn btn-ghost" disabled={page >= pages} onClick={() => load(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
