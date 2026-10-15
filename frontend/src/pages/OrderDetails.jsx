import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchOrderById } from "../services/api";
import Navbar from "../components/Navbar";

function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchOrderById(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(err.response?.data?.message || "Failed to fetch order"))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="status-center"><span className="loader-ring" /><p>Loading...</p></div>
      </main>
    </div>
  );

  if (error) return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="status error"><p>{error}</p></div>
      </main>
    </div>
  );

  if (!order) return null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="page-head">
          <h2>Order Details</h2>
        </div>

        <div className="order-detail-container">
          {/* Order Info */}
          <div className="order-detail-card">
            <h3>Order Info</h3>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            <p><strong>Status:</strong> <span className={`order-status-badge ${order.status === "PLACED" || order.status === "DELIVERED" ? "status-green" : "status-orange"}`}>{order.status}</span></p>
            <p><strong>Payment:</strong> {order.paymentStatus}</p>
          </div>

          {/* Items */}
          <div className="order-detail-card">
            <h3>Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="order-detail-item">
                <div className="order-detail-item-info">
                  {item.image && <img src={item.image} alt={item.name} className="order-item-img" />}
                  <div>
                    <strong>{item.name}</strong>
                    <div className="text-muted">Qty: {item.quantity}</div>
                  </div>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Shipping */}
          <div className="order-detail-card">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <button onClick={() => navigate("/orders")} className="btn-primary" style={{ marginTop: "16px" }}>
            ← Back to My Orders
          </button>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;
