import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context";

export default function Cart() {
  const { user, cart, cartTotal, updateCartQty, removeCart } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container empty">
        <p>Login to view your cart.</p>
        <Link to="/login" className="btn btn-blue" style={{ marginTop: 12 }}>Login</Link>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 12 }}>Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container cart-layout">
      <div className="panel">
        <h2>My Cart ({cart.length})</h2>
        {cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={item.product.image} alt={item.product.name} />
            <div>
              <Link to={`/product/${item.product.slug}`}><strong>{item.product.name}</strong></Link>
              <div className="brand">{item.product.brand}</div>
              <div className="price-row">
                <span className="price">₹{Math.round(item.product.selling_price)}</span>
                <span className="mrp">₹{Math.round(item.product.original_price)}</span>
              </div>
              <div className="qty" style={{ marginTop: 8 }}>
                <button onClick={() => item.quantity > 1 && updateCartQty(item.id, item.quantity - 1)}>-</button>
                <input value={item.quantity} readOnly />
                <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <button className="btn btn-ghost" onClick={() => removeCart(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <aside className="panel">
        <h3>Price details</h3>
        <div className="summary-row"><span>Items</span><span>₹{Math.round(cartTotal)}</span></div>
        <div className="summary-row"><span>Delivery</span><span className="success">{cartTotal >= 999 ? "FREE" : "₹49"}</span></div>
        <div className="summary-row total"><span>Total</span><span>₹{Math.round(cartTotal + (cartTotal >= 999 ? 0 : 49))}</span></div>
        <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => navigate("/checkout")}>
          Place order
        </button>
      </aside>
    </div>
  );
}
