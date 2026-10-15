import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/home" className="nav-brand">
        <span className="nav-brand-icon">🛒</span>
        <span>ShopKart</span>
      </Link>
      <div className="nav-links">
        <Link to="/home" id="nav-home">Home</Link>
        <Link to="/products" id="nav-products">Products</Link>
        <Link to="/wishlist" id="nav-wishlist">♡ Wishlist</Link>
        <Link to="/cart" className="nav-cart-link" id="nav-cart">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <Link to="/orders" id="nav-orders">My Orders</Link>
        {user && (
          <span className="nav-user">Hi, {user.fullName.split(" ")[0]}</span>
        )}
        <button onClick={handleLogout} className="btn-logout" id="nav-logout">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
