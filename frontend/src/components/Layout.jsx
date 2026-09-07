import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mailHref, telHref, waHref } from "../contact";
import { useApp } from "../context";

export default function Navbar() {
  const { user, cartCount, wishlist, logout, isAdmin, isSuper, categories, site } = useApp();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>Free delivery on sports gear above ₹999 · Easy 7-day returns</span>
          <span className="top-links">
            <a href={telHref(site.phone)} target="_blank" rel="noreferrer" title="Call" aria-label="Call">
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>
            </a>
            <a href={mailHref(site.email)} target="_blank" rel="noreferrer" title="Email" aria-label="Email">
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>
            </a>
            <a href={waHref(site.whatsapp)} target="_blank" rel="noreferrer" title="Chat" aria-label="Chat">
              <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.3 2 11.5c0 1.8.5 3.5 1.5 5L2 22l5.7-1.5c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.3 10-9.5S17.5 2 12 2zm5.1 13.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.8-.2-1.4-.5-2.4-1.1-4-3.6-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.5.6c-.1.1-.2.3-.1.5.2.4.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.6 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.9 1 2.2 1.1.3.2.5.2.6.4.1.3 0 .8-.2 1.4z"/></svg>
            </a>
            <Link to="/contact">Help</Link>
            · {user ? user.full_name || user.username : "Guest"}
          </span>
        </div>
      </div>
      <header className="header">
        <div className="container header-row">
          <Link to="/" className="logo">
            Big<span>dots</span>
          </Link>
          <form className="search" onSubmit={search}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for shoes, bats, cycles, dumbbells and more"
            />
            <button type="submit" title="Search" aria-label="Search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </button>
          </form>
          <div className="header-actions">
            {user ? (
              <>
                <Link to="/account">{user.username}</Link>
                {isAdmin && <Link to="/admin">{isSuper ? "Super Admin" : "Admin"}</Link>}
                <button className="linkish" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="head-icon" title="Login" aria-label="Login">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </Link>
            )}
            <Link to="/wishlist" className="head-icon" title="Wishlist" aria-label="Wishlist">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {wishlist.length ? <span className="badge">{wishlist.length}</span> : null}
            </Link>
            <Link to="/cart" className="head-icon" title="Cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              {cartCount ? <span className="badge">{cartCount}</span> : null}
            </Link>
          </div>
        </div>
      </header>
      <nav className="catbar">
        <div className="container">
          <NavLink to="/shop" end>
            All Sports
          </NavLink>
          {categories.map((cat) => (
            <NavLink key={cat.id} to={`/shop/${cat.slug}`}>
              {cat.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export function Footer() {
  const { categories, site } = useApp();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>{site.store_name}</h4>
          <p>
            Bigdots is a one-stop sports marketplace. Gear for running, cricket, football,
            fitness, cycling and outdoor adventures.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} to={`/shop/${cat.slug}`}>
              {cat.name}
            </Link>
          ))}
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href={telHref(site.phone)} target="_blank" rel="noreferrer">Call {site.phone}</a>
          <a href={mailHref(site.email)} target="_blank" rel="noreferrer">Email {site.email}</a>
          <a href={waHref(site.whatsapp)} target="_blank" rel="noreferrer">WhatsApp chat</a>
          <p>{site.address}</p>
        </div>
      </div>
      <div className="container copy">© {new Date().getFullYear()} Bigdots</div>
    </footer>
  );
}

export function ContactFloat() {
  const { site } = useApp();
  return (
    <div className="float-contact">
      <a className="icon-call" href={telHref(site.phone)} target="_blank" rel="noreferrer" title="Call" aria-label="Call">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>
      </a>
      <a className="icon-mail" href={mailHref(site.email)} target="_blank" rel="noreferrer" title="Email" aria-label="Email">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"/></svg>
      </a>
      <a className="icon-chat" href={waHref(site.whatsapp)} target="_blank" rel="noreferrer" title="Chat" aria-label="Chat">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.3 2 11.5c0 1.8.5 3.5 1.5 5L2 22l5.7-1.5c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.3 10-9.5S17.5 2 12 2zm5.1 13.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.8-.2-1.4-.5-2.4-1.1-4-3.6-4.1-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 2 .8 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.5.6c-.1.1-.2.3-.1.5.2.4.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.6 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.9 1 2.2 1.1.3.2.5.2.6.4.1.3 0 .8-.2 1.4z"/></svg>
      </a>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.message}</div>;
}

export function ProductCard({ product }) {
  const { wishlist, toggleWishlist, notify } = useApp();
  const loved = wishlist.some((item) => item.product_id === product.id);
  const off = product.original_price > product.selling_price
    ? Math.round(((product.original_price - product.selling_price) / product.original_price) * 100)
    : 0;

  return (
    <article className="product-card">
      {product.trending && <div className="hot">HOT</div>}
      <button
        className="wish"
        onClick={async (e) => {
          e.preventDefault();
          try {
            await toggleWishlist(product.id);
          } catch (err) {
            notify(err.message, "error");
          }
        }}
        aria-label="wishlist"
      >
        {loved ? "♥" : "♡"}
      </button>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} alt={product.name} />
        <div className="product-body">
          <div className="brand">{product.brand}</div>
          <h3>{product.name}</h3>
          {(product.color || product.size) && (
            <div className="muted">{[product.color, product.size].filter(Boolean).join(" · ")}</div>
          )}
          <div className="stars">★ {product.rating} · {product.reviews_count}</div>
          <div className="price-row">
            <span className="price">₹{Math.round(product.selling_price)}</span>
            <span className="mrp">₹{Math.round(product.original_price)}</span>
            {off ? <span className="off">{off}% off</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
