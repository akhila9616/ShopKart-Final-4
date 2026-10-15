import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import Navbar from "../components/Navbar";

function Cart() {
  const { cartItems, loading, error, subtotal, cartCount, loadCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="page-head">
          <h2>My Cart</h2>
          {!loading && !error && (
            <span className="result-count">{cartCount} {cartCount === 1 ? "item" : "items"}</span>
          )}
        </div>

        {loading && (
          <div className="status-center">
            <span className="loader-ring" />
            <p>Loading your cart...</p>
          </div>
        )}

        {!loading && error && (
          <div className="status error">
            <p>Unable to load your cart.</p>
            <button onClick={loadCart} className="btn-primary" style={{ marginTop: "12px" }}>Try Again</button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn-primary" id="browse-from-cart">Browse Products</Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout" id="cart-container">
            {/* Left: Cart Items */}
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Right: Order Summary */}
            <div className="order-summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                <span>Items ({cartCount})</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-delivery">FREE</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <button onClick={() => navigate("/checkout")} className="btn-primary btn-full checkout-btn" id="checkout-btn">
                Proceed to Checkout →
              </button>
              <Link to="/products" className="continue-shopping" id="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
