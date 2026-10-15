import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createPaymentOrderAPI, verifyPaymentAPI } from "../services/api";
import Navbar from "../components/Navbar";

function Checkout() {
  const { user } = useAuth();
  const { cartItems, subtotal, loadCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!cartItems || cartItems.length === 0) navigate("/cart");
  }, [user, cartItems, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
      newErrors.phone = "Phone must be a valid 10-digit number";
    }
    if (!shippingAddress.addressLine1.trim()) newErrors.addressLine1 = "Address is required";
    if (!shippingAddress.city.trim()) newErrors.city = "City is required";
    if (!shippingAddress.state.trim()) newErrors.state = "State is required";
    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = "Pincode must contain 6 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      // Step 1: Create payment order on backend
      const { data } = await createPaymentOrderAPI(shippingAddress);

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          try {
            // Step 4: Verify payment on backend
            const verifyRes = await verifyPaymentAPI({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Refresh cart from backend (it's now empty)
              await loadCart();
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (err) {
            setServerError(err.response?.data?.message || "Payment verification failed");
            setLoading(false);
          }
        },

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        theme: { color: "#333" },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        setServerError("Payment failed. Your cart has not been cleared. Please try again.");
        setLoading(false);
      });

      paymentObject.open();
      setLoading(false);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create order");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  if (!cartItems || cartItems.length === 0) return null;

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone",
    addressLine1: "Address",
    city: "City",
    state: "State",
    pincode: "Pincode",
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="page">
        <div className="page-head">
          <h2>Checkout</h2>
        </div>

        {serverError && (
          <div className="status error" style={{ marginBottom: "16px" }}>
            <p>{serverError}</p>
          </div>
        )}

        <div className="checkout-layout">
          {/* Shipping Form */}
          <div className="checkout-form-card">
            <h3>Shipping Details</h3>
            {Object.keys(fieldLabels).map((field) => (
              <div key={field} className="form-group">
                <label className="form-label">{fieldLabels[field]}</label>
                <input
                  type="text"
                  name={field}
                  value={shippingAddress[field]}
                  onChange={handleChange}
                  className={`form-input ${errors[field] ? "input-error" : ""}`}
                />
                {errors[field] && <span className="field-error">{errors[field]}</span>}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.product._id} className="summary-row">
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary btn-full checkout-btn"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
