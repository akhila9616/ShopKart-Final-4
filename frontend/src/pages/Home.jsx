import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

const categories = [
  { icon: "💻", label: "Electronics" },
  { icon: "👕", label: "Clothing" },
  { icon: "📚", label: "Books" },
  { icon: "🏠", label: "Home & Kitchen" },
  { icon: "⚽", label: "Sports" },
  { icon: "💄", label: "Beauty" },
];

const features = [
  { icon: "🚀", title: "Fast Delivery", desc: "Get your orders delivered at lightning speed" },
  { icon: "🔒", title: "Secure Payments", desc: "100% safe & encrypted transactions via Razorpay" },
  { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within 30 days" },
  { icon: "🎧", title: "24/7 Support", desc: "We're here whenever you need us" },
];

function Home() {
  const { user } = useAuth();
  const { cartCount } = useCart();

  if (!user) return null;

  const initial = user.fullName[0].toUpperCase();
  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page home-page">

        {/* ── Hero Section ── */}
        <section className="hero-section">
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-greeting">
              <div className="hero-avatar">{initial}</div>
              <span className="hero-badge">Welcome back 👋</span>
            </div>
            <h1 className="hero-title">
              Hey, <span className="hero-name">{firstName}!</span><br />
              Ready to shop?
            </h1>
            <p className="hero-sub">
              Discover thousands of products — from electronics to fashion, all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-primary hero-btn" id="browse-products-btn">
                🛍️ Shop Now
              </Link>
              <Link to="/orders" className="btn-outline hero-btn" id="go-orders-btn">
                📦 My Orders
              </Link>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Secure</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">{cartCount > 0 ? cartCount : "—"}</span>
              <span className="stat-label">Items in Cart</span>
            </div>
          </div>
        </section>

        {/* ── Quick Links ── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Quick Access</h2>
          </div>
          <div className="quick-links">
            <Link to="/products" className="quick-card" id="quick-products">
              <span className="quick-icon">🛍️</span>
              <span className="quick-label">All Products</span>
            </Link>
            <Link to="/wishlist" className="quick-card" id="quick-wishlist">
              <span className="quick-icon">❤️</span>
              <span className="quick-label">My Wishlist</span>
            </Link>
            <Link to="/cart" className="quick-card" id="quick-cart">
              <span className="quick-icon">🛒</span>
              <span className="quick-label">My Cart {cartCount > 0 && <span className="quick-badge">{cartCount}</span>}</span>
            </Link>
            <Link to="/orders" className="quick-card" id="quick-orders">
              <span className="quick-icon">📦</span>
              <span className="quick-label">My Orders</span>
            </Link>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="section-link">View all →</Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={`/products?category=${cat.label}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Why ShopKart?</h2>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Account Card ── */}
        <section className="home-section">
          <div className="section-header">
            <h2 className="section-title">Your Account</h2>
          </div>
          <div className="account-card">
            <div className="account-avatar">{initial}</div>
            <div className="account-info">
              <div className="account-row">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user.fullName}</span>
              </div>
              <div className="account-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
              <div className="account-row">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;