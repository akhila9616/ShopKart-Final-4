import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchProductById, addToWishlistAPI } from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const [cartStatus, setCartStatus] = useState("default"); // default | adding | done | error
  const [wishStatus, setWishStatus] = useState("default"); // default | saving | saved | error

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchProductById(id)
      .then((res) => setProduct(res.data.product))
      .catch((err) => {
        if (err.response && (err.response.status === 404 || err.response.status === 400)) {
          setError("Product not found.");
        } else {
          setError("Something went wrong while loading the product.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setCartStatus("adding");
    try {
      await addToCart(product._id);
      setCartStatus("done");
      setTimeout(() => setCartStatus("default"), 2000);
    } catch {
      setCartStatus("error");
    }
  };

  const handleWishlist = async () => {
    setWishStatus("saving");
    try {
      await addToWishlistAPI(product._id);
      setWishStatus("saved");
    } catch (err) {
      if (err.response?.status === 409) {
        setWishStatus("saved");
      } else {
        setWishStatus("error");
      }
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <Link className="back-link" to="/products" id="back-to-products">← Back to products</Link>

        {loading && (
          <div className="status-center">
            <span className="loader-ring" />
            <p>Loading product...</p>
          </div>
        )}
        {!loading && error && <p className="status error">{error}</p>}

        {!loading && !error && product && (
          <div className="details-card">
            <div className="details-image-wrap">
              <img src={product.image} alt={product.name} className="details-img" />
              {product.stock === 0 && <span className="badge-out">Out of Stock</span>}
            </div>
            <div className="details-info">
              <span className="chip">{product.category}</span>
              <h2 className="details-name">{product.name}</h2>
              <p className="details-price">₹{product.price.toLocaleString("en-IN")}</p>
              <p className="details-description">{product.description}</p>
              <p className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
                {product.stock > 0 ? `✓  ${product.stock} units in stock` : "✕  Out of stock"}
              </p>

              <div className="details-actions">
                <button
                  id="add-to-cart-btn"
                  className="btn-primary"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartStatus === "adding"}
                >
                  {cartStatus === "adding" && <span className="btn-spinner" />}
                  {cartStatus === "default" && "🛒 Add to Cart"}
                  {cartStatus === "adding" && "Adding..."}
                  {cartStatus === "done" && "✓ Added to Cart!"}
                  {cartStatus === "error" && "Failed — Try Again"}
                </button>

                <button
                  id="add-to-wishlist-btn"
                  className="btn-outline"
                  onClick={handleWishlist}
                  disabled={wishStatus === "saving" || wishStatus === "saved"}
                >
                  {wishStatus === "default" && "♡ Save to Wishlist"}
                  {wishStatus === "saving" && "Saving..."}
                  {wishStatus === "saved" && "♥ Saved!"}
                  {wishStatus === "error" && "Error — Try again"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
