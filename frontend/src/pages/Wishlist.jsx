import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWishlist, removeFromWishlistAPI } from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchWishlist();
      setWishlist(res.data.wishlist);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlistAPI(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      alert("Failed to remove product. Please try again.");
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="page-head">
          <h2>My Wishlist</h2>
          {!loading && !error && (
            <span className="result-count">{wishlist.length} saved items</span>
          )}
        </div>

        {loading && (
          <div className="status-center">
            <span className="loader-ring" />
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="status error">
            <p>Couldn't load your wishlist.</p>
            <button onClick={loadWishlist} className="btn-primary" style={{ marginTop: "12px" }}>Try Again</button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="btn-primary" id="browse-from-wishlist">Browse Products</Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="product-grid" id="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
