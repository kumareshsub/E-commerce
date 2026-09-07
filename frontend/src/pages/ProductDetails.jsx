import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context";

export default function ProductDetails() {
  const { slug } = useParams();
  const { addToCart, toggleWishlist, wishlist, notify, user } = useApp();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api(`/api/products/slug/${slug}`).then(setProduct).catch(() => setProduct(null));
  }, [slug]);

  if (!product) return <div className="container empty">Loading product…</div>;

  const off = Math.round(((product.original_price - product.selling_price) / product.original_price) * 100);
  const loved = wishlist.some((item) => item.product_id === product.id);
  const features = Array.isArray(product.features) ? product.features : [];
  const dims = [product.length_cm, product.width_cm, product.height_cm].filter((n) => Number(n) > 0);

  const shopAction = async (fn) => {
    try {
      if (!user) return navigate("/login");
      await fn();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div className="container">
      <div className="detail">
        <div>
          {product.trending && <div className="hot">HOT</div>}
          <img src={product.image} alt={product.name} />
        </div>
        <div>
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <Link to={`/shop/${product.category?.slug}`}>{product.category?.name}</Link>
          </div>
          <div className="brand">{product.brand}</div>
          <h1>{product.name}</h1>
          <div className="stars">★ {product.rating} · {product.reviews_count} ratings</div>
          <div className="meta-pills">
            {product.sku && <span>SKU {product.sku}</span>}
            {product.color && <span>{product.color}</span>}
            {product.size && <span>Size {product.size}</span>}
            {product.gender && <span>{product.gender}</span>}
          </div>
          <p style={{ margin: "12px 0" }}>{product.description}</p>
          <div className="price-row">
            <span className="price" style={{ fontSize: 28 }}>₹{Math.round(product.selling_price)}</span>
            <span className="mrp">₹{Math.round(product.original_price)}</span>
            <span className="off">{off}% off</span>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
          </p>
          <div className="qty" style={{ marginTop: 16 }}>
            <button onClick={() => setQty((n) => Math.max(1, n - 1))}>-</button>
            <input value={qty} readOnly />
            <button onClick={() => setQty((n) => Math.min(10, n + 1))}>+</button>
          </div>
          <div className="action-row">
            <button className="btn btn-primary" disabled={product.quantity < 1} onClick={() => shopAction(() => addToCart(product.id, qty))}>
              Add to cart
            </button>
            <button className="btn btn-blue" onClick={() => shopAction(() => toggleWishlist(product.id))}>
              {loved ? "Wishlisted" : "Add to wishlist"}
            </button>
          </div>
        </div>
      </div>

      <section className="specs-panel">
        <h2>Highlights</h2>
        {product.highlights && <p className="muted">{product.highlights}</p>}
        {features.length > 0 && (
          <ul className="feature-list">
            {features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <h2>Specifications</h2>
        <table className="specs">
          <tbody>
            <tr><th>SKU</th><td>{product.sku || "—"}</td></tr>
            <tr><th>Brand</th><td>{product.brand}</td></tr>
            <tr><th>Colour</th><td>{product.color || "—"}</td></tr>
            <tr><th>Size</th><td>{product.size || "—"}</td></tr>
            <tr><th>Dimensions (L × W × H)</th><td>{dims.length ? `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm` : "—"}</td></tr>
            <tr><th>Weight</th><td>{product.weight_g ? `${product.weight_g} g` : "—"}</td></tr>
            <tr><th>Material</th><td>{product.material || "—"}</td></tr>
            <tr><th>Gender</th><td>{product.gender || "—"}</td></tr>
            <tr><th>Suitable for</th><td>{product.suitable_for || "—"}</td></tr>
            <tr><th>Warranty</th><td>{product.warranty_months ? `${product.warranty_months} months` : "—"}</td></tr>
            <tr><th>Country of origin</th><td>{product.country_of_origin || "—"}</td></tr>
            <tr><th>Care</th><td>{product.care_instructions || "—"}</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
