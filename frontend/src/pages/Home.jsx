import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, asList } from "../api";
import { useApp } from "../context";
import { ProductCard } from "../components/Layout";

export default function Home() {
  const { categories } = useApp();
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api("/api/products?trending=true&sort=rating&limit=8").then((data) => setTrending(asList(data)));
    api("/api/products?sort=price_asc&limit=8").then((data) => setDeals(asList(data)));
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-card">
          <div className="kicker">Sports marketplace</div>
          <h1>Play more. Pay less. Gear up like the pros.</h1>
          <p>
            Running shoes, cricket bats, football boots, home gym and trail kit — shop sports gear on Bigdots.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Shop all sports
          </Link>
        </div>
        <div className="promo">
          <div className="kicker">Deal of the day</div>
          <h2>Up to 50% off fitness & running</h2>
          <p>Limited stock from Domyos, Kalenji and Quechua.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Shop by sport</h2>
          <Link to="/shop">View all</Link>
        </div>
        <div className="sports-grid">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop/${cat.slug}`} className="sport-tile">
              <img src={cat.image} alt={cat.name} />
              <strong>{cat.name}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Trending now</h2>
          <Link to="/shop">See more</Link>
        </div>
        <div className="product-grid">
          {trending.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Value deals</h2>
        </div>
        <div className="product-grid">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
