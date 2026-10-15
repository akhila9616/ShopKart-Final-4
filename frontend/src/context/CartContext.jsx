import { createContext, useContext, useState, useEffect } from "react";
import { fetchCart, addToCartAPI, updateCartItemAPI, removeFromCartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

// 1. Create the context
const CartContext = createContext();

// 2. Custom hook so any component can use cart data
export function useCart() {
  return useContext(CartContext);
}

// 3. Provider component — wraps the app and shares cart state everywhere
export function CartProvider({ children }) {
  const { user } = useAuth();            // only load cart when user is logged in
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch cart from backend (only when user is logged in)
  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetchCart();
      setCartItems(res.data.cart);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Reload cart whenever the logged-in user changes
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      // User logged out — clear cart immediately
      setCartItems([]);
      setError(false);
    }
  }, [user]);

  // Add product to cart
  const addToCart = async (productId) => {
    await addToCartAPI(productId);
    await loadCart(); // refresh cart from backend
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    await updateCartItemAPI(productId, quantity);
    await loadCart();
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    await removeFromCartAPI(productId);
    await loadCart();
  };

  // Derived value: total number of items in cart (sum of all quantities)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Derived value: subtotal (price × quantity for each item)
  const subtotal = cartItems.reduce((total, item) => {
    if (item.product) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        loadCart,
        addToCart,
        updateQuantity,
        removeFromCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
