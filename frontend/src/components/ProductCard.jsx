import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToWishlistAPI } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const inStock = product.stock > 0;

  // Wishlist button state
  const [wishStatus, setWishStatus] = useState("default"); // default | saving | saved | error

  // Cart button state
  const [cartStatus, setCartStatus] = useState("default"); // default | adding | error

  const handleWishlist = async () => {
    setWishStatus("saving");
    try {
      await addToWishlistAPI(product._id);
      setWishStatus("saved");
    } catch (err) {
      // If already in wishlist (409), show as saved
      if (err.response && err.response.status === 409) {
        setWishStatus("saved");
      } else {
        setWishStatus("error");
      }
    }
  };

  const handleAddToCart = async () => {
    setCartStatus("adding");
    try {
      await addToCart(product._id);
      setCartStatus("default");
    } catch {
      setCartStatus("error");
    }
  };

  return (
    <div className="product-card">
      {!inStock && <span className="badge-out">Out of stock</span>}
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <h3>{product.name}</h3>
        <span className="chip">{product.category}</span>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className={inStock ? "in-stock" : "out-of-stock"}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>
        <button onClick={() => navigate(`/products/${product._id}`)}>View Details</button>

        {/* Wishlist button */}
        <button
          className="wishlist-btn"
          onClick={handleWishlist}
          disabled={wishStatus === "saving" || wishStatus === "saved"}
        >
          {wishStatus === "default" && "♡ Add to Wishlist"}
          {wishStatus === "saving" && "⏳ Saving..."}
          {wishStatus === "saved" && "♥ Added to Wishlist"}
          {wishStatus === "error" && "Unable to save. Try again."}
        </button>

        {/* Cart button */}
        {inStock && (
          <button
            onClick={handleAddToCart}
            disabled={cartStatus === "adding"}
          >
            {cartStatus === "adding" ? "Adding..." : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
