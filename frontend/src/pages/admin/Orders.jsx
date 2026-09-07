import { useEffect, useState } from "react";
import { api } from "../../api";
import { mailHref, payBadge, telHref } from "../../contact";
import { useApp } from "../../context";

export default function AdminOrders() {
  const { notify, isSuper } = useApp();
  const [orders, setOrders] = useState([]);
  const load = () => api("/api/admin/orders").then(setOrders);
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    try {
      await api(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      notify("Order updated");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const markPaid = async (id) => {
    try {
      await api(`/api/admin/orders/${id}/payment`, { method: "PATCH", body: JSON.stringify({ payment_status: "paid" }) });
      notify("COD marked as collected");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const refund = async (id) => {
    try {
      await api(`/api/admin/orders/${id}/payment`, { method: "PATCH", body: JSON.stringify({ payment_status: "refunded" }) });
      notify("Payment refunded");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Orders</h2>
          <p className="admin-sub">{orders.length} orders</p>
        </div>
        <span className="chip">{isSuper ? "You can refund paid orders" : "Collect COD · call/email customer"}</span>
      </div>
      {orders.map((order) => (
        <article className="order-card rich" key={order.id}>
          <div className="section-head">
            <div>
              <strong>Order #{order.id}</strong>
              <div className="muted">{order.customer_name} · {order.payment_method.toUpperCase()} · {payBadge(order.payment_status)}</div>
            </div>
            <div className="order-head-right">
              <b>₹{Math.round(order.total_amount)}</b>
              <select value={order.status} onChange={(e) => update(order.id, e.target.value)}>
                {["placed", "packed", "shipped", "delivered", "cancelled"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>{item.product_name} × {item.quantity}</li>
            ))}
          </ul>
          <p className="muted">{order.address}, {order.city} · {order.payment_ref || "No payment ref"}</p>
          <div className="admin-actions">
            <a className="btn btn-ghost" href={telHref(order.phone)} target="_blank" rel="noreferrer">Call</a>
            <a className="btn btn-ghost" href={mailHref(order.customer_email || "", `Order #${order.id}`, `Hi ${order.customer_name}, about your Bigdots order #${order.id}.`)} target="_blank" rel="noreferrer">Email</a>
            {order.payment_status === "pending" && (
              <button className="btn btn-blue" onClick={() => markPaid(order.id)}>Mark COD paid</button>
            )}
            {isSuper && order.payment_status === "paid" && (
              <button className="btn btn-ghost" onClick={() => refund(order.id)}>Refund</button>
            )}
          </div>
        </article>
      ))}
      {!orders.length && <div className="empty">No orders yet.</div>}
    </>
  );
}
