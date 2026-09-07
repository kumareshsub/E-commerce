import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context";

export default function Orders() {
  const { user } = useApp();
  const [orders, setOrders] = useState([]);
  const [params] = useSearchParams();
  const placed = params.get("placed");

  useEffect(() => {
    if (user) api("/api/orders").then(setOrders);
  }, [user]);

  if (!user) return <div className="container empty">Login to view orders.</div>;

  return (
    <div className="container section">
      {placed && <p className="success">Order #{placed} placed successfully.</p>}
      <h2>My Orders</h2>
      {!orders.length && (
        <div className="empty">
          No orders yet. <Link to="/shop">Start shopping</Link>
        </div>
      )}
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="section-head">
            <strong>Order #{order.id}</strong>
            <span className="muted">{new Date(order.created_at).toLocaleString()} · {order.status}</span>
          </div>
          {order.items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.product_name} × {item.quantity}</span>
              <span>₹{Math.round(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row total"><span>Total</span><span>₹{Math.round(order.total_amount)}</span></div>
          <p className="muted">
            {order.address}, {order.city} {order.pincode} · {order.payment_method.toUpperCase()} · {order.payment_status}
            {order.payment_ref ? ` · ${order.payment_ref}` : ""}
          </p>
        </article>
      ))}
    </div>
  );
}
