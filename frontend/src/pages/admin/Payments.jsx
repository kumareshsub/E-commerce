import { useEffect, useState } from "react";
import { api } from "../../api";
import { payBadge } from "../../contact";
import { useApp } from "../../context";

export default function AdminPayments() {
  const { notify } = useApp();
  const [orders, setOrders] = useState([]);
  const load = () => api("/api/admin/payments").then(setOrders);
  useEffect(() => { load(); }, []);

  const refund = async (id) => {
    try {
      await api(`/api/admin/orders/${id}/payment`, { method: "PATCH", body: JSON.stringify({ payment_status: "refunded" }) });
      notify("Refunded");
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <>
      <div className="admin-head">
        <div>
          <h2>Payments</h2>
          <p className="admin-sub">{orders.length} transactions</p>
        </div>
        <span className="chip gold">Super admin · refunds and collections</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Method</th><th>Status</th><th>Amount</th><th>Ref</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.payment_method.toUpperCase()}</td>
                <td><span className={`pay-status ${o.payment_status}`}>{payBadge(o.payment_status)}</span></td>
                <td>₹{Math.round(o.total_amount)}</td>
                <td>{o.payment_ref || "—"}</td>
                <td>
                  {o.payment_status === "paid" && (
                    <button className="btn btn-ghost" onClick={() => refund(o.id)}>Refund</button>
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
