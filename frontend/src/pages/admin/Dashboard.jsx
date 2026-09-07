import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useApp } from "../../context";

export default function Dashboard() {
  const { isSuper } = useApp();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api("/api/admin/stats").then(setStats);
  }, []);
  if (!stats) return <p>Loading…</p>;

  const cards = isSuper
    ? [
        ["Products", stats.products],
        ["Categories", stats.categories],
        ["Orders", stats.orders],
        ["Users", stats.users],
        ["Paid revenue", `₹${Math.round(stats.revenue || 0)}`],
        ["COD pending", `₹${Math.round(stats.cod_pending || 0)}`],
      ]
    : [
        ["Products", stats.products],
        ["Categories", stats.categories],
        ["Orders", stats.orders],
        ["To fulfil", stats.pending_orders],
      ];

  return (
    <>
      <div className="stats">
        {cards.map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>

      <section className="role-compare">
        <article>
          <h3>Store Admin</h3>
          <ul>
            <li>Add and edit products</li>
            <li>Edit categories</li>
            <li>Pack, ship and deliver orders</li>
            <li>Mark COD as collected</li>
            <li>Call or email the customer</li>
          </ul>
          <p className="muted">Cannot delete catalogue, refund money, or manage staff.</p>
        </article>
        <article className="owner">
          <h3>Super Admin</h3>
          <ul>
            <li>Everything a store admin can do</li>
            <li>Create or disable admin accounts</li>
            <li>Delete products and categories</li>
            <li>Refund payments and view revenue</li>
            <li>Change email, phone and WhatsApp chat details</li>
          </ul>
          {isSuper && (
            <div className="admin-actions">
              <Link className="btn btn-blue" to="/admin/users">Manage users</Link>
              <Link className="btn btn-ghost" to="/admin/payments">Payments</Link>
              <Link className="btn btn-ghost" to="/admin/settings">Settings</Link>
            </div>
          )}
        </article>
      </section>
    </>
  );
}
