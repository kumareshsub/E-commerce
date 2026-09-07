import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context";

export default function Checkout() {
  const { user, cart, cartTotal, refreshShop, notify } = useApp();
  const navigate = useNavigate();
  const delivery = cartTotal >= 999 ? 0 : 49;
  const payable = Math.round(cartTotal + delivery);
  const [form, setForm] = useState({
    address: user?.address || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
    phone: user?.phone || "",
    payment_method: "cod",
    upi_id: "",
    card_number: "",
    card_expiry: "",
    card_cvv: "",
  });
  const [busy, setBusy] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        phone: form.phone,
        payment_method: form.payment_method,
        upi_id: form.upi_id,
        card_last4: form.card_number.replace(/\s/g, "").slice(-4),
      };
      const order = await api("/api/orders", { method: "POST", body: JSON.stringify(payload) });
      await refreshShop();
      notify(form.payment_method === "cod" ? "Order placed. Pay on delivery." : "Payment successful. Order placed.");
      navigate(`/orders?placed=${order.id}`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container cart-layout">
      <form className="panel" onSubmit={submit}>
        <h2>Delivery address</h2>
        {["address", "city", "pincode", "phone"].map((field) => (
          <div className="form-row" key={field}>
            <label>{field}</label>
            <input required value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </div>
        ))}

        <h2 style={{ marginTop: 18 }}>Payment</h2>
        <div className="pay-options">
          {[
            ["cod", "Cash on delivery", "Pay when the order arrives"],
            ["upi", "UPI", "Google Pay, PhonePe, Paytm"],
            ["card", "Debit / Credit card", "Visa, Mastercard, RuPay"],
          ].map(([value, title, hint]) => (
            <label key={value} className={`pay-card ${form.payment_method === value ? "on" : ""}`}>
              <input type="radio" name="pay" checked={form.payment_method === value} onChange={() => setForm({ ...form, payment_method: value })} />
              <strong>{title}</strong>
              <span>{hint}</span>
            </label>
          ))}
        </div>

        {form.payment_method === "upi" && (
          <div className="form-row">
            <label>UPI ID</label>
            <input required placeholder="name@oksbi" value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} />
          </div>
        )}
        {form.payment_method === "card" && (
          <>
            <div className="form-row">
              <label>Card number</label>
              <input required minLength={12} placeholder="XXXX XXXX XXXX 4242" value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} />
            </div>
            <div className="pay-split">
              <div className="form-row">
                <label>Expiry</label>
                <input required placeholder="MM/YY" value={form.card_expiry} onChange={(e) => setForm({ ...form, card_expiry: e.target.value })} />
              </div>
              <div className="form-row">
                <label>CVV</label>
                <input required minLength={3} placeholder="123" value={form.card_cvv} onChange={(e) => setForm({ ...form, card_cvv: e.target.value })} />
              </div>
            </div>
          </>
        )}

        <button className="btn btn-primary btn-full" disabled={busy || !cart.length}>
          {busy ? "Processing…" : form.payment_method === "cod" ? `Place order · ₹${payable}` : `Pay ₹${payable}`}
        </button>
      </form>
      <aside className="panel">
        <h3>Order summary</h3>
        {cart.map((item) => (
          <div className="summary-row" key={item.id}>
            <span>{item.product.name} × {item.quantity}</span>
            <span>₹{Math.round(item.product.selling_price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-row"><span>Delivery</span><span>{delivery ? `₹${delivery}` : "FREE"}</span></div>
        <div className="summary-row total"><span>To pay</span><span>₹{payable}</span></div>
      </aside>
    </div>
  );
}
