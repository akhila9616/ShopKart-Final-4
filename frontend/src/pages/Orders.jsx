import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchOrders } from "../services/api";
import Navbar from "../components/Navbar";

function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchOrders()
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError("Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="status-center"><span className="loader-ring" /><p>Loading orders...</p></div>
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
        <div className="page-head">
          <h2>My Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>You have not placed any orders yet.</h3>
            <button onClick={() => navigate("/products")} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <strong>Order #{order._id.slice(-8)}</strong>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>

                <div className="order-card-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-line">
                      {item.name} × {item.quantity}
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div>
                    <strong>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                    <span className={`order-status-badge ${order.status === "PLACED" || order.status === "DELIVERED" ? "status-green" : "status-orange"}`}>
                      {order.status}
                    </span>
                  </div>
                  <button onClick={() => navigate(`/orders/${order._id}`)} className="btn-small">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
