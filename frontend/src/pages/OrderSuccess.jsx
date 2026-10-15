import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchOrderById } from "../services/api";
import Navbar from "../components/Navbar";

function OrderSuccess() {
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
      .catch(() => setError("Failed to load order details"))
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

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="order-success-container">
          <div className="success-icon">✅</div>
          <h2>Order Placed Successfully!</h2>

          <div className="order-success-details">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> ₹{order.totalAmount.toLocaleString("en-IN")}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </div>

          <p className="success-message">Your order has been saved successfully.</p>

          <div className="success-actions">
            <button onClick={() => navigate("/orders")} className="btn-primary">
              View My Orders
            </button>
            <button onClick={() => navigate("/products")} className="btn-secondary">
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccess;
