import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api, asList } from "../api";
import { useApp } from "../context";
import { ProductCard } from "../components/Layout";

export default function Shop() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { categories } = useApp();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState("");
  const q = params.get("q") || "";

  useEffect(() => {
    api("/api/products/brands").then(setBrands);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [slug, q, brand, sort, maxPrice]);

  useEffect(() => {
    const query = new URLSearchParams();
    if (slug) query.set("category", slug);
    if (q) query.set("q", q);
    if (brand) query.set("brand", brand);
    if (sort) query.set("sort", sort);
    if (maxPrice) query.set("max_price", maxPrice);
    query.set("page", String(page));
    query.set("limit", "24");
    api(`/api/products?${query.toString()}`).then((data) => {
      setProducts(asList(data));
      setTotal(Array.isArray(data) ? data.length : data.total || 0);
      setPages(Array.isArray(data) ? 1 : data.pages || 1);
    });
  }, [slug, q, brand, sort, maxPrice, page]);

  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="container shop-layout">
      <aside className="filters">
        <h3>Filters</h3>
        <div className="filter-group">
          <strong>Category</strong>
          <label>
            <Link to="/shop"><input type="radio" name="cat" checked={!slug} readOnly /> All</Link>
          </label>
          {categories.map((c) => (
            <label key={c.id}>
              <Link to={`/shop/${c.slug}`}>
                <input type="radio" name="cat" checked={slug === c.slug} readOnly /> {c.name}
              </Link>
            </label>
          ))}
        </div>
        <div className="filter-group">
          <label>
            Brand
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter-group">
          <label>
            Max price (₹)
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 2000" />
          </label>
        </div>
        <div className="filter-group">
          <label>
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer rating</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </aside>
      <section>
        <div className="section-head">
          <h2>{category ? category.name : q ? `Results for “${q}”` : "All products"}</h2>
          <span className="muted">{total} items</span>
        </div>
        {products.length ? (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {pages > 1 && (
              <div className="pager">
                <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</button>
                <span>Page {page} of {pages}</span>
                <button className="btn btn-ghost" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty">No products match these filters.</div>
        )}
      </section>
    </div>
  );
}
