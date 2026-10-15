import { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // Re-fetch from the backend whenever search / category / sort changes.
  // The small delay (debounce) avoids firing a request on every keystroke.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const timer = setTimeout(() => {
      fetchProducts({ search: search.trim(), category, sort })
        .then((res) => {
          if (!cancelled) setProducts(res.data.products);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category, sort]);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="page-head">
          <h2>Products</h2>
          {!loading && !error && (
            <span className="result-count">{products.length} products found</span>
          )}
        </div>

        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
        />

        {loading && (
          <div className="status-center">
            <span className="loader-ring" />
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <p className="status error">Something went wrong while loading products.</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="status">No products found. Try a different search.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid" id="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
