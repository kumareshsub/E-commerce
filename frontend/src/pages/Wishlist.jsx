import { Link } from "react-router-dom";
import { useApp } from "../context";
import { ProductCard } from "../components/Layout";

export default function Wishlist() {
  const { user, wishlist } = useApp();
  if (!user) {
    return (
      <div className="container empty">
        Login to see saved products. <Link to="/login">Login</Link>
      </div>
    );
  }
  if (!wishlist.length) {
    return (
      <div className="container empty">
        <h2>No favourites yet</h2>
        <Link to="/shop" className="btn btn-blue" style={{ marginTop: 12 }}>Browse products</Link>
      </div>
    );
  }
  return (
    <div className="container section">
      <h2>Wishlist</h2>
      <div className="product-grid" style={{ marginTop: 16 }}>
        {wishlist.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  );
}
